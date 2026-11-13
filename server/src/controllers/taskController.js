const mongoose = require('mongoose');
const { Task } = require('../models');
const ApiError = require('../utils/ApiError');

async function getTasks(req, res, next) {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ status: 1, order: 1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, dueDate, color, order } = req.body;

    const task = await Task.create({
      userId: req.user.id, // jamais pris du body (§15)
      title,
      description,
      status,
      priority,
      dueDate,
      color,
      order,
    });

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant de tâche invalide.');
    }

    // 404 (pas 403) si la tâche n'appartient pas à l'utilisateur, pour ne
    // pas révéler l'existence de tâches d'autrui (§15).
    const task = await Task.findOne({ _id: id, userId: req.user.id });
    if (!task) {
      throw new ApiError(404, 'Tâche introuvable.');
    }

    const { title, description, status, priority, dueDate, color, order } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (color !== undefined) task.color = color;
    if (order !== undefined) task.order = order;

    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant de tâche invalide.');
    }

    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!task) {
      throw new ApiError(404, 'Tâche introuvable.');
    }

    res.json({ message: 'Tâche supprimée.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTasks, createTask, updateTask, deleteTask };
