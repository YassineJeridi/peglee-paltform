const request = require('supertest');
const app = require('../../src/app');
const { User, Module, SubModule } = require('../../src/models');
const { hashPassword } = require('../../src/utils/password');

let counter = 0;
function uniqueSuffix() {
  counter += 1;
  return `${Date.now()}_${counter}`;
}

const DEFAULT_PASSWORD = 'Password123!';

async function createUser({ role = 'student', password = DEFAULT_PASSWORD } = {}) {
  const suffix = uniqueSuffix();
  const passwordHash = await hashPassword(password);
  const user = await User.create({
    username: `user_${suffix}`,
    email: `user_${suffix}@test.local`,
    passwordHash,
    role,
  });
  return { user, password };
}

async function loginAs(user, password) {
  const res = await request(app).post('/api/auth/login').send({ email: user.email, password });
  if (res.status !== 200) {
    throw new Error(`Échec de connexion dans un test (helper) : ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.token;
}

async function createUserWithToken(overrides) {
  const { user, password } = await createUser(overrides);
  const token = await loginAs(user, password);
  return { user, token, password };
}

async function createStudentWithToken(overrides) {
  return createUserWithToken({ role: 'student', ...overrides });
}

async function createAdminWithToken(overrides) {
  return createUserWithToken({ role: 'admin', ...overrides });
}

async function createModuleTree() {
  const module = await Module.create({ title: 'Module Test', slug: `module-test-${uniqueSuffix()}` });
  const subModule = await SubModule.create({ moduleId: module._id, title: 'Sous-module Test' });
  return { module, subModule };
}

module.exports = {
  request,
  app,
  DEFAULT_PASSWORD,
  createUser,
  loginAs,
  createUserWithToken,
  createStudentWithToken,
  createAdminWithToken,
  createModuleTree,
};
