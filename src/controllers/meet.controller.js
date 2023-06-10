const env = require("../config/env.config.js");
const routes = require("../routes/index.js");
const Sequelize = require("sequelize");
const Joi = require("joi");
const axios = require("axios");
const db = require("../models/index.js");

module.exports = {
  createMeet: async (req, res) => {
    //chreate shcema
    const schema = Joi.object({
      topic: Joi.string().required().messages({
        "any.required": "topic is required",
      }),
      start_time: Joi.date().iso().required().messages({
        "any.required": "start_time is required",
        "date.iso": "start_time must be in ISO format",
      }),
      password: Joi.string().optional(),
      agenda: Joi.string().optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await db.User.findOne({
      where: { email: req.user.email },
    });

    const { topic, start_time, timezone, password, agenda } = req.body;

    //create meeting
    const data = {
      topic: topic,
      start_time: start_time,
      timezone: "ID",
      password: password ?? "123456",
      agenda: agenda ?? "",
    };
    const config = {
      headers: {
        Authorization: `Bearer ${user.zoom_key}`,
      },
    };
    try {
      const response = await axios.post(
        `https://api.zoom.us/v2/users/me/meetings`,
        data,
        config
      );
      const { join_url } = response.data;
      return res.status(201).json({
        topic: topic,
        start_time: start_time,
        timezone: "ID",
        password: password ?? "123456",
        agenda: agenda ?? "",
        join_url: join_url,
      });
    }
    catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
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






