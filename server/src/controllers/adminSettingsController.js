const ApiError = require('../utils/ApiError');
const { getOrCreateSettings } = require('../services/settingsService');

async function getSettings(req, res, next) {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const { defaultPassingScore, defaultMaxAttempts, features } = req.body;

    if (
      defaultPassingScore !== undefined &&
      (typeof defaultPassingScore !== 'number' || defaultPassingScore < 0 || defaultPassingScore > 100)
    ) {
      throw new ApiError(400, 'Le seuil de réussite par défaut doit être un nombre entre 0 et 100.', [
        { field: 'defaultPassingScore', message: 'Le seuil de réussite par défaut doit être un nombre entre 0 et 100.' },
      ]);
    }
    if (defaultMaxAttempts !== undefined && (typeof defaultMaxAttempts !== 'number' || defaultMaxAttempts < 0)) {
      throw new ApiError(400, 'Le nombre de tentatives par défaut doit être un nombre positif ou nul.', [
        { field: 'defaultMaxAttempts', message: 'Le nombre de tentatives par défaut doit être un nombre positif ou nul.' },
      ]);
    }

    const settings = await getOrCreateSettings();
    if (defaultPassingScore !== undefined) settings.defaultPassingScore = defaultPassingScore;
    if (defaultMaxAttempts !== undefined) settings.defaultMaxAttempts = defaultMaxAttempts;
    if (features !== undefined) {
      settings.features = { ...settings.features.toObject(), ...features };
    }

    await settings.save();
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, updateSettings };
