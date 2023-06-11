const env = require('../config/env.config.js');
const routes = require('../routes/index.js');
const Sequelize = require('sequelize');
const Joi = require('joi');
const db = require('../models/index.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
      zoom_key: Joi.string().required().messages({
        'any.required': 'zoom_key is required',
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
        { zoom_key: req.body.zoom_key },
        { transaction: transaction }
      );
      transaction.commit();

      //return user
      return res.status(200).json({
        message: 'Zoom Key updated successfully',
        user: {
          name: user.name,
          email: user.email,
          zoom_key: user.zoom_key,
          balance: user.balance,
          tier: user.tier.name,
          status: user.status,
        },
      });
    } catch (error) {
      transaction.rollback();
      return res.status(500).json({ error: error.message });
    }
  }
};





