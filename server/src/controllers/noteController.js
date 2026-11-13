const mongoose = require('mongoose');
const { Note } = require('../models');
const ApiError = require('../utils/ApiError');

async function getNotes(req, res, next) {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ pinned: -1, createdAt: -1 });
    res.json(notes);
  } catch (err) {
    next(err);
  }
}

async function createNote(req, res, next) {
  try {
    const { content, color } = req.body;

    const note = await Note.create({
      userId: req.user.id, // jamais pris du body (§15)
      content,
      color,
    });

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

async function updateNote(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant de note invalide.');
    }

    // 404 (pas 403) si la note n'appartient pas à l'utilisateur (§15).
    const note = await Note.findOne({ _id: id, userId: req.user.id });
    if (!note) {
      throw new ApiError(404, 'Note introuvable.');
    }

    const { content, color, pinned } = req.body;
    if (content !== undefined) note.content = content;
    if (color !== undefined) note.color = color;
    if (pinned !== undefined) note.pinned = pinned;

    await note.save();
    res.json(note);
  } catch (err) {
    next(err);
  }
}

async function deleteNote(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant de note invalide.');
    }

    const note = await Note.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!note) {
      throw new ApiError(404, 'Note introuvable.');
    }

    res.json({ message: 'Note supprimée.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotes, createNote, updateNote, deleteNote };
