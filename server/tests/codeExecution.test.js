const { request, app, createStudentWithToken, createAdminWithToken, createModuleTree } = require('./helpers/factories');
const { Exercise, Progress } = require('../src/models');
const env = require('../src/config/env');

env.codeExecution.engine = 'local';
env.codeExecution.timeoutMs = 1500;

async function setup({ quizPassed = true } = {}) {
  const tree = await createModuleTree();
  const student = await createStudentWithToken();
  if (quizPassed) {
    await Progress.create({ userId: student.user._id, subModuleId: tree.subModule._id, quizPassed: true, lessonCompleted: true, status: 'in_progress' });
  }
  const exercise = await Exercise.create({
    subModuleId: tree.subModule._id,
    title: 'Double',
    statement: 'x',
    type: 'python',
    solution: 'print(int(input()) * 2)',
    tests: [{ input: '2\n', expectedOutput: '4' }, { input: '5\n', expectedOutput: '10' }],
  });
  return { student, exercise };
}

const run = (token, id, code) =>
  request(app).post(`/api/exercises/${id}/run`).set('Authorization', `Bearer ${token}`).send({ code });

describe('POST /api/exercises/:id/run', () => {
  it('valide un code correct et ne divulgue pas la solution', async () => {
    const { student, exercise } = await setup();
    const res = await run(student.token, exercise._id, 'print(int(input()) * 2)');
    expect(res.status).toBe(200);
    expect(res.body.allPassed).toBe(true);
    expect(JSON.stringify(res.body)).not.toContain('solution');
  });

  it('signale un code faux', async () => {
    const { student, exercise } = await setup();
    const res = await run(student.token, exercise._id, 'print(int(input()) + 2)');
    expect(res.body.allPassed).toBe(false);
    expect(res.body.results[1].actual).toBe('7');
  });

  it('interrompt une boucle infinie', async () => {
    const { student, exercise } = await setup();
    const res = await run(student.token, exercise._id, 'while True: pass');
    expect(res.status).toBe(200);
    expect(res.body.results[0].timedOut).toBe(true);
    expect(res.body.allPassed).toBe(false);
  }, 15000);

  it('refuse sans quiz réussi', async () => {
    const { student, exercise } = await setup({ quizPassed: false });
    expect((await run(student.token, exercise._id, 'print(1)')).status).toBe(403);
  });

  it("l'admin vérifie la solution de référence", async () => {
    const { exercise } = await setup();
    const admin = await createAdminWithToken();
    const res = await request(app)
      .post(`/api/exercises/${exercise._id}/run-solution`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(res.status).toBe(200);
    expect(res.body.allPassed).toBe(true);
  });
});
