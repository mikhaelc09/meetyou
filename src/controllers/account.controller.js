const env = require('../config/env.config.js');
const routes = require('../routes/index.js');
const Sequelize = require('sequelize');
const Joi = require('joi');
const db = require('../models/index.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { response } = require('express');

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
    try{
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
          balance: "Rp. "+ user.balance,
          tier: user.tier.name,
          status: user.status,
        },
      });
    }catch(error){
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
        // "Authorization": "Basic " + Buffer.from(`L2s69BONRqqx9BfTTtxS8w:KUHwFpGgk8SsDjBgOvDnt65p46t0mFRE`).toString('base64')
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





