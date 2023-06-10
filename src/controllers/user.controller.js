const env = require('../config/env.config.js');
const routes = require('../routes/index.js');
const Sequelize = require('sequelize');
const Joi = require('joi');
const db = require('../models/index.js');

module.exports = {
  registerUser: async (req, res) => {
    const schema = Joi.object({
      name: Joi.string().required().messages({
        'any.required': 'name is required',
      }),
      email: Joi.string().email().required().messages({
        'any.required': 'email is required',
        'string.email': 'email is invalid',
      }),
      password: Joi.string().min(6).required().messages({
        'any.required': 'password is required',
        'string.min': 'password must be at least 6 characters',
      }),
    });

    balance = 0;
    tier_id = 1;
    status = 'active';
    console.log(db.User);
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
  
      const { name, email, password, zoom_key } = req.body;
      const user = await db.User.create({
        name: name,
        email: email,
        password: password,
        zoom_key: zoom_key,
        balance: balance,
        tier_id: tier_id,
        status: status,
      });

      return res.status(201).json({
        message: 'User created successfully',
        user: user,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  loginUser: async (req, res) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    try {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ error: 'Email not found' });
      }
      if (user.password !== password) {
        return res.status(400).json({ error: 'Password incorrect' });
      }

      return res.status(200).json(user);
    }
    catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};





