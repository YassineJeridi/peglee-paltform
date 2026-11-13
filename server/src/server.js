const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

const mongoose = require('mongoose');

async function start() {
  await connectDB();
  const server = app.listen(env.port, () => {
    console.log(`[server] API démarrée sur http://localhost:${env.port} (${env.nodeEnv})`);
  });

  // Arrêt propre (docker stop, pm2 reload) : on termine les requêtes en cours.
  const shutdown = (signal) => {
    console.log(`[server] ${signal} reçu, arrêt en cours…`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  console.error('[server] Promesse rejetée non gérée :', reason);
});

start();
