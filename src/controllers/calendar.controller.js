const { google } = require("googleapis");
const oauth2Client = require("../config/google_oauth.config.js");
const db = require("../models/index.js");
const Joi = require("joi");

module.exports = {
  getCalendar: async (req, res) => {
    const { n, min, max } = req.query;

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const year = new Date().getFullYear();
    const result = await calendar.events.list({
      calendarId: "primary",
      maxResults: n ?? 10,
      orderBy: "updated",
      timeMin: min ?? new Date(year, 1).toISOString(),
      timeMax: max ?? new Date(year, 12).toISOString(),
      singleEvents: true,
    });
    const events = result.data.items.map((event) => {
      const start = event.start.dateTime || event.start.date;
      const end = event.end.dateTime || event.end.date;
      return {
        id: event.id,
        title: event.summary,
        status: event.status,
        location: event.location,
        start: start,
        end: end,
        description: event.description,
        link: event.htmlLink,
      };
    });
    if (!events.length) {
      return res.status(200).json({
        message: "OK",
        events: "No events found",
      });
    }

    return res.status(200).send({
      message: "OK",
      events,
    });
  },
  createCalendar: async (req, res) => {
    const schema = Joi.object({
      title: Joi.string().required().messages({
        "any.required": "title is required",
      }),
      description: Joi.string().optional(),
      meet_id: Joi.string().optional(),
      start: Joi.date().iso().default(Date.now).min("now").messages({
        "date.iso": "Date must be in ISO 8601 date format",
        "date.min": "Date cannot be past now",
      }),
      end: Joi.date().iso().default(Date.now).min(Joi.ref("start")).messages({
        "date.iso": "Date must be in ISO 8601 date format",
        "date.min": "Date cannot be past the start",
      }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    if (req.body.meet_id) {
      var meet = await db["Meet"].findByPk(req.body.meet_id);
      if (!meet) {
        return res.status(404).json({ error: "Meet does not exists!" });
      }
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const event = {
      summary: req.body.title,
      description: req.body.description,
      start: {
        dateTime: req.body.start,
        timeZone: "Asia/Jakarta",
      },
      end: {
        dateTime: req.body.end,
        timeZone: "Asia/Jakarta",
      },
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 10 }],
      },
    };
    if (meet) {
      event.location = meet.url;
    }
    let createdEvent;
    const result = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
    createdEvent = {
      id: result.data.id,
      title: result.data.summary,
      location: result.data.location,
      status: result.data.status,
      start: result.data.start.dateTime,
      end: result.data.end.dateTime,
      description: result.data.description,
      link: result.data.htmlLink,
    };
    return res.status(200).json({
      message: "OK",
      event: createdEvent,
    });
  },
  editCalendar: async (req, res) => {
    const schema = Joi.object({
      title: Joi.string().optional(),
      description: Joi.string().optional(),
      meet_id: Joi.string().optional(),
      start: Joi.date().iso().optional().min("now").messages({
        "date.iso": "Date must be in ISO 8601 date format",
        "date.min": "Date cannot be past now",
      }),
      end: Joi.date().iso().optional().min(Joi.ref("start")).messages({
        "date.iso": "Date must be in ISO 8601 date format",
        "date.min": "Date cannot be past the start",
      }),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const id = req.params.id;
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const { title, description, start, end, meet_id } = req.body;

    if (req.body.meet_id) {
      var meet = await db["Meet"].findByPk(req.body.meet_id);
      if (!meet) {
        return res.status(404).json({ error: "Meet does not exists!" });
      }
    }

    let updatedEvent = {
      summary: title,
      description,
      start: {
        dateTime: start,
        timeZone: "Asia/Jakarta",
      },
      end: {
        dateTime: end,
        timeZone: "Asia/Jakarta",
      },
    };
    if(meet){
      updatedEvent.location= meet.url
    }
    const result = await calendar.events.update({
      calendarId: "primary",
      eventId: id,
      requestBody: updatedEvent,
    });
    updatedEvent = {
      id: result.data.id,
      title: result.data.summary,
      location: result.data.location,
      status: result.data.status,
      start: result.data.start.dateTime,
      end: result.data.end.dateTime,
      description: result.data.description,
      link: result.data.htmlLink,
    };
    return res.status(200).json({
      message: "OK",
      event: updatedEvent,
    });
  },
  deleteCalendar: async (req, res) => {
    const id = req.params.id;
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const findResult = await calendar.events.get({
      calendarId: "primary",
      eventId: id,
    });
    let deletedEvent = {
      id: findResult.data.id,
      title: findResult.data.summary,
      status: findResult.data.status,
      location: findResult.data.location,
      start: findResult.data.start.dateTime,
      end: findResult.data.end.dateTime,
      description: findResult.data.description,
      link: findResult.data.htmlLink,
    };
    await calendar.events.delete({
      calendarId: "primary",
      eventId: id,
    });
    return res.status(200).json({
      message: "OK",
      event: deletedEvent,
    });
  },
};
