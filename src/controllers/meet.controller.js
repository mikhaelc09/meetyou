const env = require("../config/env.config.js");
const routes = require("../routes/index.js");
const Sequelize = require("sequelize");
const Joi = require("joi");

const sequelize = new Sequelize(
  env("DB_NAME"),
  env("DB_USER"),
  env("DB_PASS"),
  {
    host: env("DB_HOST"),
    dialect: env("DB_DIALECT"),
  }
);

const Meet = sequelize.define("meets", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  nama: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  deskripsi: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  url: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  waktu: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

sequelize.sync();

const getMeetUser = async (req, res) => {
  try {
    const meet = await Meet.findOne({ where: { user_id } });
    if(!meet){
        return res.status(400).json({ error: 'User not found' });
    }
    return res.status(200).json(meet);
} catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
    getMeetUser
};