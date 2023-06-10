const env = require('../config/env.config.js');
const routes = require('../routes/index.js');
const Sequelize = require('sequelize');
const Joi = require('joi');
const db = require('../models/index.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
  registerUser: async (req, res) => {
    //create schema
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
      zoom_key: Joi.string().optional(),
    });

    balance = 0;
    tier_id = 1;
    status = 'active';

    //start transaction
    const transaction = await db.sequelize.transaction();
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      //check if email already exists
      const emailExists = await db.User.findOne({
        where: { email: req.body.email },
      });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      //create new user
      const { name, email, password, zoom_key } = req.body;
      await db.User.create({
        name: name,
        email: email,
        password: bcrypt.hashSync(password, 10),
        zoom_key: zoom_key,
        balance: balance,
        tier_id: tier_id,
        status: status,
      }, { transaction: transaction });
      transaction.commit();

      const user = await db.User.findOne({
        where: { email: email },
        include: [{ model: db.Tier, as: "tier" }]
      });

      //return user
      return res.status(201).json({
        message: 'User created successfully',
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
  },

  loginUser: async (req, res) => {
    //create schema
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        'any.required': 'email is required',
        'string.email': 'email is invalid',
      }),
      password: Joi.string().min(6).required().messages({
        'any.required': 'password is required',
        'string.min': 'password must be at least 6 characters',
      }),
    });

    //do login
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ error: 'User does not exists' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Password incorrect' });
    }

    //generate token
    const token = jwt.sign(
      { email: user.email },
      env("SECRET"),
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: "Login successful",
      token: token,
    });
  },
};





