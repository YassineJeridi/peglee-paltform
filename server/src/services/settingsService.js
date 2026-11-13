const { Settings } = require('../models');

// Upsert transparent : garantit qu'un seul document Settings existe toujours,
// créé avec les valeurs par défaut du schéma au premier appel.
async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
}

module.exports = { getOrCreateSettings };
