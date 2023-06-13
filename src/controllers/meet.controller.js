const env = require("../config/env.config.js");
const routes = require("../routes/index.js");
const Sequelize = require("sequelize");
const Joi = require("joi");
const axios = require("axios");
const db = require("../models/index.js");

module.exports = {
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
        } else {
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
        message: `${success.length} email(s) successfully invited, ${failed.length} email(s) failed to invite`,
        success: success,
        failed: failed,
      });
    } catch (error) {
      transaction.rollback();
      return res.status(500).json({ error: error.message });
    }
  },

  getInvite: async (req, res) => {
    //create schema
    const schema = Joi.object({
      target: Joi.string().valid("me", "sent").required().messages({
        "any.required": "target is required",
        "string.valid": "target must be ME or SENT",
      }),
      status: Joi.string().valid("pending", "accepted", "rejected").optional().messages({
        "string.valid": "status must be pending, accepted, or rejected",
      }),
    });

    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await db.User.findOne({
      where: { email: req.user.email },
    });
    if (req.query.target == "me") {
      const invite = await db.Invite.findAll({
        where: { user_id: user.id, status: {[db.Sequelize.Op.like]: `%${req.query.status??""}%`} },
        attributes: ["id", "status"],
        include: [{
          model: db.Meet,
          as: "meet",
          attributes: ["id","topic", "start_time"],
        }],
      });
      return res.status(200).json({ data: invite });
    } else {
      const invite = await db.Invite.findAll({
        attributes: ["id", "status"],
        include: [{
          model: db.Meet,
          as: "meet",
          attributes: ["id","topic", "start_time"],
          where: { user_id: user.id },
        },
        {
          model: db.User,
          as: "user",
          attributes: ["name", "email"],
        }]
      });

      return res.status(200).json({ data: invite });
    }
  },

  getInviteById: async (req, res) => {
    const invite = await db.Invite.findOne({
      where: { id: req.params.id },
      attributes: ["id", "status", "user_id"],
      include: {
        model: db.Meet,
        as: "meet",
        attributes: ["id","topic", "agenda", "url", "start_time"],
      },
    });

    if (!invite) {
      return res.status(404).json({ error: "Invite not found" });
    }

    const user = await db.User.findOne({
      where: { email: req.user.email },
    });

    if(invite.user_id != user.id){
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.status(200).json({ 
      data: {
        id: invite.id,
        status: invite.status,
        meet: invite.meet,
      }
    });
  },

  responseInvite: async (req, res) => {
    //create schema
    const schema = Joi.object({
      action: Joi.string().valid("accept", "reject").required().messages({
        "any.required": "action is required",
        "string.valid": "action must be accept or reject",
      }),
    });

    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const invite = await db.Invite.findOne({
      where: { id: req.params.id },
      attributes: ["id", "status", "user_id"],
      include: {
        model: db.Meet,
        as: "meet",
        attributes: ["id","topic", "agenda", "url", "start_time"],
      },
    });

    if (!invite) {
      return res.status(404).json({ error: "Invite not found" });
    }

    const user = await db.User.findOne({
      where: { email: req.user.email },
    });

    if(invite.user_id != user.id){
      return res.status(401).json({ error: "Unauthorized" });
    }

    if(invite.status != "PENDING"){
      return res.status(400).json({ error: `Invite already ${invite.status}` });
    }

    if(req.query.action == "accept"){
      await db.Invite.update({ status: "ACCEPTED" }, { where: { id: req.params.id } });
      return res.status(200).json({ message: "Invite accepted" });
    }else{
      await db.Invite.update({ status: "REJECTED" }, { where: { id: req.params.id } });
      return res.status(200).json({ message: "Invite rejected" });
    }
  },

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

      db.History.create({
        user_id: user.id,
        action: `Make Meeting ${req.body.topic}`
      })
      transaction.commit();

      return res.status(201).json({
        message: "Meeting created successfully",
        meeting: {
          topic: topic,
          start_time: start_time,
          timezone: "ID",
          password: password ?? "123456",
          agenda: agenda ?? "",
          join_url: "join_url",
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
        attributes: ['id', 'topic', 'agenda', 'url', 'start_time']
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
        attributes: ['id', 'topic', 'agenda', 'url', 'start_time']
      });

      if (!meets) {
        return res.status(404).json({ error: "Meeting not found" });
      }

      return res.status(200).json(meets);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  getHistoryMeet: async (req, res) => {
    try{
      const user = await db.User.findOne({
        where: { email: req.user.email },
      });

      const history = await db.History.findAll({
        where: { user_id: user.id },
        attributes: ['id', 'action', 'createdAt']
      });

      if(history.length == 0){
        return res.status(404).json({error:"User doesn't have meeting history"});
      }

      return res.status(200).json(history);
    }catch(error){
      return res.status(500).json({ error: error.message });
    }
  },
};






