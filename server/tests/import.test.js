const fs = require('fs');
const path = require('path');
const { request, app, createAdminWithToken, createStudentWithToken } = require('./helpers/factories');
const { Module, SubModule, Quiz, Exercise, Lesson } = require('../src/models');

const template = fs.readFileSync(path.resolve(__dirname, '../../docs/templates/content-template.json'));

const upload = (token, buf, q = '') =>
  request(app).post(`/api/admin/import${q}`).set('Authorization', `Bearer ${token}`).attach('file', buf, 'c.json');

describe('POST /api/admin/import', () => {
  it('importe le modèle fourni (leçon + quiz + exercices) et est idempotent', async () => {
    await Module.create({ title: 'Algorithmique', slug: 'algorithmique' });
    const admin = await createAdminWithToken();

    const dry = await upload(admin.token, template, '?dryRun=true');
    expect(dry.status).toBe(200);
    expect(await SubModule.countDocuments({ title: 'Exemple — Les opérateurs' })).toBe(0);

    expect((await upload(admin.token, template)).status).toBe(200);
    expect((await upload(admin.token, template)).status).toBe(200);

    const sub = await SubModule.findOne({ title: 'Exemple — Les opérateurs' });
    expect(await Lesson.countDocuments({ subModuleId: sub._id })).toBe(1);
    const quiz = await Quiz.findOne({ subModuleId: sub._id });
    expect(quiz.questions).toHaveLength(4);
    expect(quiz.questions[2].correctAnswers).toEqual([1]);
    expect(await Exercise.countDocuments({ subModuleId: sub._id })).toBe(2);
  });

  it("refuse et n'écrit rien si le fichier contient une erreur", async () => {
    await Module.updateOne({ slug: 'algorithmique' }, { title: 'Algorithmique' }, { upsert: true });
    const admin = await createAdminWithToken();
    const doc = JSON.parse(template);
    doc.subModule.title = 'Ne doit pas exister';
    doc.quiz.questions[0].correctAnswers = [9];
    const res = await upload(admin.token, Buffer.from(JSON.stringify(doc)));
    expect(res.status).toBe(422);
    expect(res.body.errors[0].path).toBe('quiz.questions[0].correctAnswers');
    expect(await SubModule.countDocuments({ title: 'Ne doit pas exister' })).toBe(0);
  });

  it('refuse un JSON invalide, un non-JSON et un élève', async () => {
    const admin = await createAdminWithToken();
    const student = await createStudentWithToken();
    expect((await upload(admin.token, Buffer.from('{oops'))).status).toBe(422);
    expect(
      (await request(app).post('/api/admin/import').set('Authorization', `Bearer ${admin.token}`).attach('file', Buffer.from('x'), 'a.txt')).status
    ).toBe(400);
    expect((await upload(student.token, template)).status).toBe(403);
  });
});
