const jwt = require('jsonwebtoken');
const env = require('../src/config/env');
const { request, app, DEFAULT_PASSWORD, createUser } = require('./helpers/factories');

describe('POST /api/auth/register', () => {
  it('crée un nouveau compte élève', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'newstudent',
      email: 'newstudent@test.local',
      password: DEFAULT_PASSWORD,
      confirmPassword: DEFAULT_PASSWORD,
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('student');
    expect(res.body.user.email).toBe('newstudent@test.local');
  });

  it("refuse un e-mail déjà utilisé", async () => {
    const { user } = await createUser({ role: 'student' });

    const res = await request(app).post('/api/auth/register').send({
      username: 'someoneelse',
      email: user.email,
      password: DEFAULT_PASSWORD,
      confirmPassword: DEFAULT_PASSWORD,
    });
    expect(res.status).toBe(409);
  });

  it('refuse une confirmation de mot de passe différente', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'mismatch',
      email: 'mismatch@test.local',
      password: DEFAULT_PASSWORD,
      confirmPassword: 'AutreChose123!',
    });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  it('refuse un mauvais mot de passe', async () => {
    const { user } = await createUser({ role: 'student' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'MauvaisMotDePasse!' });

    expect(res.status).toBe(401);
  });

  it('refuse un e-mail inconnu', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@test.local', password: DEFAULT_PASSWORD });

    expect(res.status).toBe(401);
  });

  it('connecte avec les bons identifiants et renvoie un token exploitable', async () => {
    const { user, password } = await createUser({ role: 'student' });

    const res = await request(app).post('/api/auth/login').send({ email: user.email, password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${res.body.token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe(user.email);
  });

  it('refuse la connexion d\'un compte désactivé', async () => {
    const { user, password } = await createUser({ role: 'student' });
    user.isActive = false;
    await user.save();

    const res = await request(app).post('/api/auth/login').send({ email: user.email, password });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/auth/me — vérification du token', () => {
  it('refuse une requête sans token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('refuse un token invalide', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer ceci-nest-pas-un-token');
    expect(res.status).toBe(401);
  });

  it('refuse un token expiré', async () => {
    const { user } = await createUser({ role: 'student' });
    const expiredToken = jwt.sign({ id: user._id.toString(), role: user.role }, env.jwtSecret, {
      expiresIn: -10,
    });

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });
});
