const {
  request,
  app,
  createStudentWithToken,
  createAdminWithToken,
} = require('./helpers/factories');
const { Badge, Notification, UserBadge, User } = require('../src/models');
const xpService = require('../src/services/xpService');

describe('Badges & notifications', () => {
  it('attribue un badge une seule fois et notifie', async () => {
    const badge = await Badge.create({
      title: 'Niveau 2',
      criteria: { type: 'level_reached', value: 2 },
    });
    const { user, token } = await createStudentWithToken();

    await xpService.award(user._id, 150);
    await xpService.award(user._id, 10);

    expect(await UserBadge.countDocuments({ userId: user._id, badgeId: badge._id })).toBe(1);

    const list = await request(app).get('/api/notifications').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.unreadCount).toBeGreaterThanOrEqual(2); // level_up + badge_earned
    expect(list.body.items.some((n) => n.type === 'badge_earned')).toBe(true);

    const mine = await request(app).get('/api/badges/me').set('Authorization', `Bearer ${token}`);
    expect(mine.body.find((b) => b.title === 'Niveau 2').earned).toBe(true);

    const all = await request(app)
      .put('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);
    expect(all.status).toBe(200);
    const after = await request(app).get('/api/notifications').set('Authorization', `Bearer ${token}`);
    expect(after.body.unreadCount).toBe(0);
  });

  it("n'expose pas les notifications d'un autre élève", async () => {
    const a = await createStudentWithToken();
    const b = await createStudentWithToken();
    const n = await Notification.create({ userId: a.user._id, type: 'info', message: 'x' });
    const res = await request(app)
      .put(`/api/notifications/${n._id}/read`)
      .set('Authorization', `Bearer ${b.token}`);
    expect(res.status).toBe(404);
  });

  it("l'admin gère les badges, l'élève non", async () => {
    const admin = await createAdminWithToken();
    const student = await createStudentWithToken();
    const body = { title: 'Assidu', criteria: { type: 'exercises_completed', value: 5 } };

    expect(
      (await request(app).post('/api/badges').set('Authorization', `Bearer ${student.token}`).send(body)).status
    ).toBe(403);
    const created = await request(app)
      .post('/api/badges')
      .set('Authorization', `Bearer ${admin.token}`)
      .send(body);
    expect(created.status).toBe(201);
    const bad = await request(app)
      .post('/api/badges')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ title: 'X', criteria: { type: 'nope' } });
    expect(bad.status).toBe(400);
  });
});

describe('Mot de passe oublié', () => {
  const PasswordResetToken = require('../src/models/PasswordResetToken');
  const crypto = require('crypto');

  it('répond de façon identique pour un email connu ou inconnu', async () => {
    const { user } = await createStudentWithToken();
    const known = await request(app).post('/api/auth/forgot-password').send({ email: user.email });
    const unknown = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'inconnu@test.local' });
    expect(known.status).toBe(200);
    expect(unknown.status).toBe(200);
    expect(known.body).toEqual(unknown.body);
    expect(await PasswordResetToken.countDocuments({ userId: user._id })).toBe(1);
  });

  it('réinitialise le mot de passe avec un jeton valide, une seule fois', async () => {
    const { user } = await createStudentWithToken();
    const token = 'a'.repeat(64);
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
      expiresAt: new Date(Date.now() + 60000),
    });
    const payload = { token, newPassword: 'NouveauPass123!', confirmNewPassword: 'NouveauPass123!' };
    expect((await request(app).post('/api/auth/reset-password').send(payload)).status).toBe(200);
    expect((await request(app).post('/api/auth/reset-password').send(payload)).status).toBe(400);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'NouveauPass123!' });
    expect(login.status).toBe(200);
  });

  it('refuse un jeton expiré', async () => {
    const { user } = await createStudentWithToken();
    const token = 'b'.repeat(64);
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
      expiresAt: new Date(Date.now() - 1000),
    });
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'NouveauPass123!', confirmNewPassword: 'NouveauPass123!' });
    expect(res.status).toBe(400);
  });
});
