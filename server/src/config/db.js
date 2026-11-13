const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log('[db] Connexion MongoDB établie.');
  } catch (err) {
    console.error('[db] Impossible de se connecter à MongoDB :', err.message);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('[db] Erreur MongoDB :', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] Connexion MongoDB perdue.');
  });
}

module.exports = { connectDB };
