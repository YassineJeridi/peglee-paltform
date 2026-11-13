const mongoose = require('mongoose');
const { Lesson, SubModule } = require('../models');
const ApiError = require('../utils/ApiError');

async function getLesson(req, res, next) {
  try {
    const { subModuleId } = req.params;

    if (!mongoose.isValidObjectId(subModuleId)) {
      throw new ApiError(400, 'Identifiant de sous-module invalide.');
    }

    const lesson = await Lesson.findOne({ subModuleId });
    if (!lesson) {
      throw new ApiError(404, "Aucune leçon n'est encore disponible pour ce sous-module.");
    }

    // `_id` est ajouté (au-delà des champs strictement affichés à l'élève)
    // pour que l'admin puisse réutiliser cet endpoint de lecture et savoir
    // s'il doit créer ou modifier (tâche 4.5) sans endpoint dédié.
    res.json({
      _id: lesson._id,
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      attachments: lesson.attachments,
    });
  } catch (err) {
    next(err);
  }
}

async function createLesson(req, res, next) {
  try {
    const { subModuleId, title, content, videoUrl, attachments } = req.body;

    if (!subModuleId || !mongoose.isValidObjectId(subModuleId)) {
      throw new ApiError(400, 'Identifiant de sous-module invalide.');
    }
    if (!title) {
      throw new ApiError(400, 'Le titre est requis.');
    }

    const subModule = await SubModule.findById(subModuleId);
    if (!subModule) {
      throw new ApiError(404, 'Sous-module introuvable.');
    }

    // Contrainte 1-1 déjà posée en base (index unique sur subModuleId,
    // tâche 0.3) — vérifiée ici en amont pour renvoyer un message clair
    // plutôt qu'une erreur de doublon générique.
    const existing = await Lesson.findOne({ subModuleId });
    if (existing) {
      throw new ApiError(
        409,
        "Une leçon existe déjà pour ce sous-module. Modifiez-la plutôt que d'en créer une nouvelle.",
        [{ field: 'subModuleId', message: 'Une leçon existe déjà pour ce sous-module.' }]
      );
    }

    const lesson = await Lesson.create({ subModuleId, title, content, videoUrl, attachments });
    res.status(201).json(lesson);
  } catch (err) {
    next(err);
  }
}

async function updateLesson(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant de leçon invalide.');
    }

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      throw new ApiError(404, 'Leçon introuvable.');
    }

    const { title, content, videoUrl, attachments } = req.body;
    if (title !== undefined) lesson.title = title;
    if (content !== undefined) lesson.content = content;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (attachments !== undefined) lesson.attachments = attachments;

    await lesson.save();
    res.json(lesson);
  } catch (err) {
    next(err);
  }
}

async function deleteLesson(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, 'Identifiant de leçon invalide.');
    }

    const lesson = await Lesson.findByIdAndDelete(id);
    if (!lesson) {
      throw new ApiError(404, 'Leçon introuvable.');
    }

    res.json({ message: 'Leçon supprimée.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLesson, createLesson, updateLesson, deleteLesson };
