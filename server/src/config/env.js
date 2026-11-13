const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const REQUIRED = ['MONGODB_URI', 'JWT_SECRET'];

const missing = REQUIRED.filter((key) => !process.env[key] || !process.env[key].trim());

if (missing.length > 0) {
  console.error(
    `[config] Variables d'environnement manquantes : ${missing.join(', ')}.\n` +
      `Copiez server/.env.example vers server/.env et renseignez-les.`
  );
  process.exit(1);
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5001,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5183',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  trustProxy: process.env.TRUST_PROXY || '',
  serveClient: process.env.SERVE_CLIENT === 'true',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Bac Informatique <no-reply@localhost>',
  },
  codeExecution: {
    // 'piston' (recommandé en production), 'local' (développement uniquement), 'disabled'
    engine: process.env.CODE_ENGINE || 'local',
    pistonUrl: process.env.PISTON_URL || 'http://localhost:2000',
    timeoutMs: Number(process.env.CODE_TIMEOUT_MS) || 5000,
  },
};

env.isProduction = env.nodeEnv === 'production';

if (env.isProduction) {
  const problems = [];
  if (env.jwtSecret.length < 32 || /change_this/i.test(env.jwtSecret)) {
    problems.push('JWT_SECRET doit être un secret aléatoire d\'au moins 32 caractères');
  }
  if (!env.smtp.host) problems.push('SMTP_HOST est requis (réinitialisation de mot de passe)');
  if (env.codeExecution.engine === 'local' && process.env.ALLOW_LOCAL_CODE_ENGINE !== 'true') {
    problems.push(
      "CODE_ENGINE=local n'est pas un sandbox sûr : utilisez CODE_ENGINE=piston (ou disabled)"
    );
  }
  if (problems.length > 0) {
    console.error(`[config] Configuration de production invalide :\n - ${problems.join('\n - ')}`);
    process.exit(1);
  }
}

module.exports = env;
