const { execSync } = require('child_process');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Réutilise un `mongod` déjà installé sur la machine (`brew install
// mongodb-community` par ex.) quand il est disponible, pour éviter à
// mongodb-memory-server de télécharger un binaire à chaque environnement.
// Sans binaire système trouvé, on laisse la librairie faire son
// téléchargement habituel (nécessite un accès réseau, ex. en CI).
function findSystemMongod() {
  try {
    return execSync('which mongod', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || undefined;
  } catch {
    return undefined;
  }
}

module.exports = async function globalSetup() {
  const systemBinary = findSystemMongod();
  const mongod = await MongoMemoryServer.create(systemBinary ? { binary: { systemBinary } } : undefined);

  // `global` est partagé entre globalSetup et globalTeardown (tous deux
  // exécutés dans le process principal de Jest, jamais dans un worker) :
  // c'est le seul moyen de faire survivre l'instance jusqu'au teardown.
  global.__MONGOD__ = mongod;

  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_SECRET = 'test_jwt_secret_key_do_not_use_in_production';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.CLIENT_URL = 'http://localhost:5183';
};
