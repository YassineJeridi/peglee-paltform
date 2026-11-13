const {
  request,
  app,
  createStudentWithToken,
  createAdminWithToken,
  createModuleTree,
} = require('./helpers/factories');

describe('Middleware de rôle — accès admin refusé à un student', () => {
  it('refuse une requête sans token sur un endpoint admin', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('refuse un student sur les statistiques admin (403)', async () => {
    const { token } = await createStudentWithToken();
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('autorise un admin sur les statistiques admin', async () => {
    const { token } = await createAdminWithToken();
    const res = await request(app).get('/api/admin/stats').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('refuse un student sur la gestion des utilisateurs (403)', async () => {
    const { token } = await createStudentWithToken();
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('refuse un student sur la création de module (403)', async () => {
    const { token } = await createStudentWithToken();
    const res = await request(app)
      .post('/api/modules')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Nouveau module', slug: 'nouveau-module' });
    expect(res.status).toBe(403);
  });

  it('refuse un student sur la création de quiz (403)', async () => {
    const { token } = await createStudentWithToken();
    const { subModule } = await createModuleTree();
    const res = await request(app)
      .post('/api/quiz')
      .set('Authorization', `Bearer ${token}`)
      .send({ subModuleId: subModule._id, title: 'Quiz', questions: [] });
    expect(res.status).toBe(403);
  });

  it('refuse un student sur la création d\'exercice (403)', async () => {
    const { token } = await createStudentWithToken();
    const { subModule } = await createModuleTree();
    const res = await request(app)
      .post('/api/exercises')
      .set('Authorization', `Bearer ${token}`)
      .send({ subModuleId: subModule._id, title: 'Exercice', statement: 'Énoncé', type: 'python' });
    expect(res.status).toBe(403);
  });

  it('refuse un student sur les paramètres généraux admin (403)', async () => {
    const { token } = await createStudentWithToken();
    const res = await request(app).get('/api/admin/settings').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
