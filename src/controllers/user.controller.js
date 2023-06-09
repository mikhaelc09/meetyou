const env = require('../config/env.config.js');
const routes = require('../routes/index.js');
const Sequelize = require('sequelize');
const Joi = require('joi');

const sequelize = new Sequelize(
  env('DB_NAME'),
  env('DB_USER'),
  env('DB_PASS'),
  {
    host: env('DB_HOST'),
    dialect: env('DB_DIALECT')
  }
);

const User = sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nama: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  saldo: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  tier_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isIn: [['active', 'inactive']]
    }
  }
});

sequelize.sync();

const registerUser = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  saldo = 0;
  tier_id = 1;
  status = 'active';

  try {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { name, email, password } = req.body;
    const user = await User.create({
      name,
      email,
      password,
      saldo,
      tier_id,
      status
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const loginUser = async (req, res) => {
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
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const changePassword = async (req, res) => {
  
};

module.exports = {
  registerUser,
  loginUser
};