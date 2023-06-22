const env = require('../config/env.config.js');
const routes = require('../routes/index.js');
const Sequelize = require('sequelize');
const Joi = require('joi');
const db = require('../models/index.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { response } = require('express');
const fs = require("fs");

module.exports = {
  updatePassword: async (req, res) => {
    //create schema
    const schema = Joi.object({
      new_password: Joi.string().min(6).required().messages({
        'any.required': 'new_password is required',
        'string.min': 'new_password must be at least 6 characters',
      }),
      old_password: Joi.string().min(6).required().messages({
        'any.required': 'old_password is required',
        'string.min': 'old_password be at least 6 characters',
      }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    //start transaction
    const transaction = await db.sequelize.transaction();
    try {
      //update password
      let user = await db.User.findOne({
        where: { email: req.user.email },
      });

      if (!bcrypt.compareSync(req.body.old_password, user.password)) {
        return res.status(400).json({ error: 'Invalid password' });
      }

      if (!user || user.status == 'INACTIVE') {
        return res.status(404).json({ error: 'User does not exists' });
      }

      user.password = bcrypt.hashSync(req.body.new_password, 10);
      await user.save({ transaction: transaction });
      transaction.commit();

      return res.status(200).json({ message: 'Password updated successfully' });
    }
    catch (error) {
      transaction.rollback();
      return res.status(500).json({ error: error.message });
    }
  },

  topUpBalance: async (req, res) => {
    //create schema
    const schema = Joi.object({
      amount: Joi.number().min(1000).required().messages({
        'any.required': 'amount is required',
        'number.min': 'amount must be at least 1000',
      }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    //start transaction
    const transaction = await db.sequelize.transaction();
    try {
      //top up balance
      let user = await db.User.findOne({
        where: { email: req.user.email },
        include: [{ model: db.Tier, as: "tier" }]
      });

      if (!user || user.status == 'INACTIVE') {
        return res.status(404).json({ error: 'User does not exists' });
      }

      //toint user balance
      user.balance += parseInt(req.body.amount);
      await user.save({ transaction: transaction });
      transaction.commit();

      //return user
      return res.status(200).json({
        message: 'Balance updated successfully',
        user: {
          name: user.name,
          email: user.email,
          balance: user.balance,
          tier: user.tier.name,
        }
      });
    } catch (error) {
      transaction.rollback();
      return res.status(500).json({ error: error.message });
    }
  },

  upgradeTier: async (req, res) => {
    //create schema
    const schema = Joi.object({
      tier: Joi.string().valid('FREE', 'PERSONAL', 'BUSINESS', 'ENTERPRISE').required().messages({
        'any.required': 'tier is required',
        'any.only': 'tier must be FREE, PERSONAL, BUSINESS, or ENTERPRISE',
      }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    let tier = await db.Tier.findOne({
      where: { name: req.body.tier }
    });

    let user = await db.User.findOne({
      where: { email: req.user.email },
      include: [{ model: db.Tier, as: "tier" }]
    });

    if (!user || user.status == 'INACTIVE') {
      return res.status(404).json({ error: 'User does not exists' });
    }

    if (user.tier.name == tier.name) {
      return res.status(400).json({ error: 'You already have this tier' });
    }

    if (user.tier.id > tier.id) {
      return res.status(400).json({ error: 'You cannot downgrade your tier' });
    }

    if (user.balance < tier.price) {
      return res.status(400).json({ error: 'Your balance is not enough' });
    }

    //start transaction
    const transaction = await db.sequelize.transaction();
    try {
      //upgrade tier
      user.balance -= tier.price;
      user.tier_id = tier.id;
      await user.save({ transaction: transaction });
      transaction.commit();

      //return user
      return res.status(200).json({
        message: 'Tier updated successfully',
        user: {
          name: user.name,
          email: user.email,
          balance: user.balance,
          tier: user.tier.name,
        }
      });
    } catch (error) {
      transaction.rollback();
      return res.status(500).json({ error: error.message });
    }
  },

  updatePicture: async (req, res) => {
    let user = await db.User.findOne({
      where: { email: req.user.email },
    });

    fs.renameSync(
      `./src/uploads/${req.file.filename}`,
      `./src/uploads/${user.id}.png`
    );
    return res.status(200).json({
      data: "succesfully update picture",
    });
  },

  updateZoomKey: async (req, res) => {
    //create schema
    const schema = Joi.object({
      zoom_id: Joi.string().required().messages({
        "any.required": "zoom_id is required"
      }),
      zoom_secret: Joi.string().required().messages({
        "any.required": "zoom_secret is required"
      }),
      password: Joi.string().min(6).required().messages({
        'any.required': 'password is required',
        'string.min': 'password must be at least 6 characters',
      }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    //start transaction
    const transaction = await db.sequelize.transaction();
    try {
      //update zoom key
      let user = await db.User.findOne({
        where: { email: req.user.email },
        include: [{ model: db.Tier, as: "tier" }]
      });

      if (!bcrypt.compareSync(req.body.password, user.password)) {
        return res.status(400).json({ error: 'Invalid password' });
      }

      if (!user || user.status == 'INACTIVE') {
        return res.status(404).json({ error: 'User does not exists' });
      }

      user = await user.update(
        { zoom_id: req.body.zoom_id, zoom_secret: req.body.zoom_secret },
        { transaction: transaction }
      );
      transaction.commit();

      //return user
      return res.status(200).json({
        message: 'Zoom Secret/ID updated successfully',
        user: {
          name: user.name,
          email: user.email,
          zoom_id: user.zoom_id,
          zoom_secret: user.zoom_secret,
          balance: user.balance,
          tier: user.tier.name,
          status: user.status,
        },
      });
    } catch (error) {
      transaction.rollback();
      return res.status(500).json({ error: error.message });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await db.User.findOne({
        where: { email: req.user.email },
        include: [{ model: db.Tier, as: "tier" }]
      });

      if (!user || user.status == 'INACTIVE') {
        return res.status(404).json({ error: 'User does not exists' });
      }

      return res.status(200).json({
        user: {
          name: user.name,
          email: user.email,
          zoom_key: user.zoom_key,
          balance: "Rp. " + user.balance,
          tier: user.tier.name,
          status: user.status,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getToken: async (req, res) => {
    const user = await db.User.findOne({
      where: { email: req.user.email },
    });

    return res.status(200).json({
      auth_url: `https://zoom.us/oauth/authorize?response_type=code&client_id=${user.zoom_id}&redirect_uri=${encodeURI(`http://127.0.0.1:3000/v1/account/zoom/redirect?id=${user.id}`)}`
    })
  },

  redirectToken: async (req, res) => {
    const user = await db.User.findOne({
      where: { id: req.query.id },
    });

    let data = {
      code: req.query.code,
      grant_type: "authorization_code",
      redirect_uri: `http://127.0.0.1:3000/v1/account/zoom/redirect?id=${user.id}`
    }

    var config = {
      method: 'post',
      url: 'https://zoom.us/oauth/token',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(`${user.zoom_id}:${user.zoom_secret}`).toString('base64')
      },
      data: data
    };

    //transaction start
    const transaction = await db.sequelize.transaction();
    try {
      const response = await axios(config);

      //update zoom token
      user.zoom_key = response.data.access_token;
      await user.save({ transaction: transaction });
      transaction.commit();
      console.log(response.data.access_token);
      return res.status(200).json({ message: "Zoom Token retrieved successfully" });
    } catch (error) {
      return res.status(400).json({ message: "Invalid Zoom Secret/ID, please configure using [PUT] /account/zoom" });
    }
  },

};





