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
      start_time: Joi.date().required().iso().greater('now').messages({
        "any.required": "start_time is required",
        "date.iso": "start_time must be in ISO format",
        "date.greater": "start_time must be greater than now",
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

    const { topic, start_time, password, agenda } = req.body;

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

    //start transaction
    const transaction = await db.sequelize.transaction();
    try {
      const response = await axios.post(
        `https://api.zoom.us/v2/users/me/meetings`,
        data,
        config
      );
      const { join_url } = response.data;

      //create new meet
      await db.Meet.create({
        topic: topic,
        agenda: agenda,
        url: join_url,
        start_time: start_time,
        user_id: user.id,
      }, { transaction: transaction });
      transaction.commit();

      return res.status(201).json({
        message: "Meeting created successfully",
        meeting: {
          topic: topic,
          start_time: start_time,
          timezone: "ID",
          password: password ?? "123456",
          agenda: agenda ?? "",
          join_url: join_url,
        }
      });
    }
    catch (error) {
      transaction.rollback();
      if (error.message === "Request failed with status code 401") {
        return res.status(401).json({ error: "Invalid Zoom Key" });
      }
      return res.status(500).json({ error: error.message });
    }
  },

  getMeet: async (req, res) => {
    try {
      const user = await db.User.findOne({
        where: { email: req.user.email },
      });

      const meets = await db.Meet.findAll({
        where: { user_id: user.id },
        attributes : ['id', 'topic', 'agenda', 'url', 'start_time']
      });
      return res.status(200).json(meets);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getMeetById: async (req, res) => {
    try {
      const user = await db.User.findOne({
        where: { email: req.user.email },
      });

      const meets = await db.Meet.findOne({
        where: { user_id: user.id, id: req.params.id },
        attributes : ['id', 'topic', 'agenda', 'url', 'start_time']
      });

      if (!meets) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      
      return res.status(200).json(meets);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  inviteMeet: async (req, res) => {
    //chreate shcema
    const schema = Joi.object({
      email: Joi.array().items(Joi.string().email()).required().messages({
        "any.required": "email is required",
        "string.email": "email must be in email format",
      }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    //check if meeting exist
    const thisUser = await db.User.findOne({
      where: { email: req.user.email },
    });

    const meet = await db.Meet.findOne({
      where: { id: req.params.id, user_id: thisUser.id },
    });

    if (!meet) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    const emails = req.body.email;
    //start transaction
    const transaction = await db.sequelize.transaction();
    try {
      let success = [];
      let failed = [];
      for (const email of emails) {
        const user = await db.User.findOne({
          where: { email: email },
        });

        if (!user || user.status == "INACTIVE" || email == req.user.email) {
          failed.push(email);
        }else {
          const invite = await db.Invite.findOne({
            where: { user_id: user.id, meet_id: req.params.id },
          });

          if (!invite) {
            await db.Invite.create({
              meet_id: req.params.id,
              user_id: user.id,
              status: "PENDING",
            }, { transaction: transaction });
          }

          success.push(email);
        }
      }

      transaction.commit();
        return res.status(200).json({
          message: `${success.length} email(s) successfully invited, ${failed.length} email(s) failed to invite}`,
          success: success,
          failed: failed,
        });
    } catch (error) {
      transaction.rollback();
      return res.status(500).json({ error: error.message });
    }
  }
};






