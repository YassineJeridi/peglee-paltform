const mongoose = require('mongoose');
const { SubModule, Module, Lesson, Quiz, Exercise } = require('../models');
const ApiError = require('../utils/ApiError');

async function createSubModule(req, res, next) {
  try {
    const { moduleId, title, description, order, estimatedDuration } = req.body;

    if (!moduleId || !mongoose.isValidObjectId(moduleId)) {
      throw new ApiError(400, 'Identifiant de module invalide.');
    }
    if (!title) {
      throw new ApiError(400, 'Le titre est requis.');
    }

    const module = await Module.findById(moduleId);
    if (!module) {
      throw new ApiError(404, 'Module introuvable.');
    }

    const subModule = await SubModule.create({ moduleId, title, description, order, estimatedDuration });
    res.status(201).json(subModule);
  } catch (err) {
    next(err);
  }
}

async function updateSubModule(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant de sous-module invalide.');
    }

    const subModule = await SubModule.findById(id);
    if (!subModule) {
      throw new ApiError(404, 'Sous-module introuvable.');
    }

    const { title, description, order, estimatedDuration, moduleId } = req.body;

    if (moduleId !== undefined && moduleId !== subModule.moduleId.toString()) {
      if (!mongoose.isValidObjectId(moduleId)) {
        throw new ApiError(400, 'Identifiant de module invalide.');
      }
      const targetModule = await Module.findById(moduleId);
      if (!targetModule) {
        throw new ApiError(404, 'Module cible introuvable.');
      }
      subModule.moduleId = moduleId;
    }

    if (title !== undefined) subModule.title = title;
    if (description !== undefined) subModule.description = description;
    if (order !== undefined) subModule.order = order;
    if (estimatedDuration !== undefined) subModule.estimatedDuration = estimatedDuration;

    await subModule.save();
    res.json(subModule);
  } catch (err) {
    next(err);
  }
}

async function deleteSubModule(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant de sous-module invalide.');
    }

    const subModule = await SubModule.findById(id);
    if (!subModule) {
      throw new ApiError(404, 'Sous-module introuvable.');
    }

    // Même garde-fou que pour les modules : un sous-module avec une leçon,
    // un quiz ou des exercices déjà rattachés ne peut pas être supprimé
    // directement, pour éviter de perdre du contenu saisi par erreur.
    const [lesson, quiz, exerciseCount] = await Promise.all([
      Lesson.findOne({ subModuleId: id }),
      Quiz.findOne({ subModuleId: id }),
      Exercise.countDocuments({ subModuleId: id }),
    ]);

    if (lesson || quiz || exerciseCount > 0) {
      throw new ApiError(
        409,
        "Impossible de supprimer ce sous-module : du contenu (leçon, quiz ou exercices) y est encore rattaché. Supprimez-le d'abord."
      );
    }

    await subModule.deleteOne();
    res.json({ message: 'Sous-module supprimé.' });
  } catch (err) {
    next(err);
  }
}

async function reorderSubModules(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Une liste { id, order } est requise.');
    }

    const invalid = items.find((it) => !mongoose.isValidObjectId(it.id) || typeof it.order !== 'number');
    if (invalid) {
      throw new ApiError(400, 'Format invalide : chaque élément doit avoir un id valide et un order numérique.');
    }

    await Promise.all(items.map((it) => SubModule.updateOne({ _id: it.id }, { $set: { order: it.order } })));

    res.json({ message: 'Ordre mis à jour.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createSubModule, updateSubModule, deleteSubModule, reorderSubModules };
