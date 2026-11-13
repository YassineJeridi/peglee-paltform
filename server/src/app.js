const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

const env = require('./config/env');
const { apiLimiter } = require('./middlewares/rateLimiter');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

if (env.trustProxy) {
  // Derrière nginx / un load balancer : nécessaire pour que le rate limiting voie la vraie IP.
  app.set('trust proxy', /^\d+$/.test(env.trustProxy) ? Number(env.trustProxy) : env.trustProxy);
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // Monaco (web worker) et images de profil / data URIs.
        'worker-src': ["'self'", 'blob:'],
        'img-src': ["'self'", 'data:', 'blob:'],
        'font-src': ["'self'", 'data:'],
      },
    },
    // Les images /uploads sont affichées par le front, parfois d'une autre origine en dev.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
if (env.nodeEnv !== 'test') {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  const dbUp = require('mongoose').connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? 'ok' : 'degraded' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/modules', require('./routes/moduleRoutes'));
app.use('/api/submodules', require('./routes/subModuleRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/exercises', require('./routes/exerciseRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/badges', require('./routes/badgeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Production : l'API sert aussi le frontend compilé (client/dist) avec repli SPA.
if (env.serveClient) {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(
      express.static(clientDist, {
        index: false,
        setHeaders: (res, filePath) => {
          // Les fichiers hachés de Vite sont immuables.
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
    app.get(/^\/(?!api\/|uploads\/).*/, (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  } else {
    console.warn('[server] SERVE_CLIENT=true mais client/dist est introuvable (npm run build).');
  }
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
