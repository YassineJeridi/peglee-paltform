const mongoose = require('mongoose');
const { Event } = require('../models');
const ApiError = require('../utils/ApiError');

const END_BEFORE_START_MESSAGE = 'La date de fin doit être postérieure ou égale à la date de début.';

async function getEvents(req, res, next) {
  try {
    const { start, end, upcoming, limit } = req.query;

    // Mode « prochains événements », réutilisé par le widget de l'overview
    // étudiant (tâche 2.9) — même endpoint, pas de route dédiée.
    if (upcoming === 'true') {
      const events = await Event.find({ userId: req.user.id, end: { $gte: new Date() } })
        .sort({ start: 1 })
        .limit(Math.min(Number(limit) || 5, 20));
      res.json(events);
      return;
    }

    const filter = { userId: req.user.id };
    if (start && end) {
      // Chevauchement avec la plage visible du calendrier (§14), pas
      // seulement les événements dont `start` tombe dans la plage — un
      // événement commencé avant et se terminant dedans doit rester visible.
      filter.start = { $lte: new Date(end) };
      filter.end = { $gte: new Date(start) };
    }

    const events = await Event.find(filter).sort({ start: 1 });
    res.json(events);
  } catch (err) {
    next(err);
  }
}

async function createEvent(req, res, next) {
  try {
    const { title, description, start, end, type, color } = req.body;

    if (!start || !end) {
      throw new ApiError(400, 'Les dates de début et de fin sont requises.');
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new ApiError(400, 'Date invalide.');
    }
    if (endDate < startDate) {
      throw new ApiError(400, END_BEFORE_START_MESSAGE);
    }

    const event = await Event.create({
      userId: req.user.id, // jamais pris du body (§15)
      title,
      description,
      start: startDate,
      end: endDate,
      type,
      color,
    });

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

async function updateEvent(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant d\'événement invalide.');
    }

    const event = await Event.findOne({ _id: id, userId: req.user.id });
    if (!event) {
      throw new ApiError(404, 'Événement introuvable.');
    }

    const { title, description, start, end, type, color } = req.body;
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (start !== undefined) event.start = new Date(start);
    if (end !== undefined) event.end = new Date(end);
    if (type !== undefined) event.type = type;
    if (color !== undefined) event.color = color;

    if (event.end < event.start) {
      throw new ApiError(400, END_BEFORE_START_MESSAGE);
    }

    await event.save();
    res.json(event);
  } catch (err) {
    next(err);
  }
}

async function deleteEvent(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant d\'événement invalide.');
    }

    const event = await Event.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!event) {
      throw new ApiError(404, 'Événement introuvable.');
    }

    res.json({ message: 'Événement supprimé.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
