const { Lesson, Quiz } = require('../src/models');
const { request, app, createStudentWithToken, createModuleTree } = require('./helpers/factories');

describe('Déverrouillage progressif : leçon -> quiz -> exercices', () => {
  let token;
  let subModule;
  let quiz;

  beforeEach(async () => {
    const created = await createStudentWithToken();
    token = created.token;

    const tree = await createModuleTree();
    subModule = tree.subModule;

    await Lesson.create({ subModuleId: subModule._id, title: 'Leçon', content: 'Contenu' });
    quiz = await Quiz.create({
      subModuleId: subModule._id,
      title: 'Quiz',
      passingScore: 60,
      questions: [{ text: 'Q1', type: 'single', options: ['A', 'B'], correctAnswers: [0], points: 1 }],
    });
  });

  it('refuse l\'accès aux exercices tant que le quiz n\'a pas été réussi (403)', async () => {
    const res = await request(app)
      .get(`/api/exercises/${subModule._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('refuse toujours l\'accès aux exercices une fois la leçon terminée mais avant de réussir le quiz', async () => {
    const lessonRes = await request(app)
      .post(`/api/progress/lesson/${subModule._id}/complete`)
      .set('Authorization', `Bearer ${token}`);
    expect(lessonRes.status).toBe(200);
    expect(lessonRes.body.lessonCompleted).toBe(true);

    const res = await request(app)
      .get(`/api/exercises/${subModule._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('ne déverrouille pas les exercices si le quiz est raté', async () => {
    const submitRes = await request(app)
      .post(`/api/quiz/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [{ questionId: quiz.questions[0]._id, answer: [1] }] }); // mauvaise réponse

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.passed).toBe(false);

    const res = await request(app)
      .get(`/api/exercises/${subModule._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('déverrouille les exercices une fois la leçon terminée et le quiz réussi', async () => {
    await request(app)
      .post(`/api/progress/lesson/${subModule._id}/complete`)
      .set('Authorization', `Bearer ${token}`);

    const submitRes = await request(app)
      .post(`/api/quiz/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [{ questionId: quiz.questions[0]._id, answer: [0] }] }); // bonne réponse

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.passed).toBe(true);

    const res = await request(app)
      .get(`/api/exercises/${subModule._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('respecte le nombre maximal de tentatives de quiz (403 au delà)', async () => {
    quiz.maxAttempts = 1;
    await quiz.save();

    const first = await request(app)
      .post(`/api/quiz/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [{ questionId: quiz.questions[0]._id, answer: [1] }] });
    expect(first.status).toBe(200);

    const second = await request(app)
      .post(`/api/quiz/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ answers: [{ questionId: quiz.questions[0]._id, answer: [0] }] });
    expect(second.status).toBe(403);
  });
});
