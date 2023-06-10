const env = require("../config/env.config.js");
const routes = require("../routes/index.js");
const Sequelize = require("sequelize");
const Joi = require("joi");

module.exports = {
  createMeet: async (req, res) => {
    
  },

  getMeetUser: async (req, res) => {
    try {
      const meet = await Meet.findOne({ where: { user_id } });
      if (!meet) {
        return res.status(400).json({ error: "User not found" });
      }
      return res.status(200).json(meet);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getMeetById: async (req, res) => {
    try {
      const meet = await Meet.findOne({ where: { id } });
      if (!meet) {
        return res.status(400).json({ error: "User not found" });
      }
      return res.status(200).json(meet);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};






