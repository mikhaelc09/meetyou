const env = require('./config/env.config');
const routes = require('./routes/index');
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

const User = sequelize.define('Users', {
  id: {
    type: Sequelize.INTEGER,
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
};

module.exports = {
  registerUser,
  loginUser
};