const { Task, Note, Event } = require('../src/models');
const { request, app, createStudentWithToken } = require('./helpers/factories');

describe('Isolation des données entre élèves — Tâches', () => {
  it('un élève ne peut ni lire, ni modifier, ni supprimer les tâches d\'un autre', async () => {
    const alice = await createStudentWithToken();
    const bob = await createStudentWithToken();

    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${alice.token}`)
      .send({ title: 'Tâche privée d\'Alice' });
    expect(created.status).toBe(201);
    const taskId = created.body._id;

    const bobList = await request(app).get('/api/tasks').set('Authorization', `Bearer ${bob.token}`);
    expect(bobList.body.find((t) => t._id === taskId)).toBeUndefined();

    const bobUpdate = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${bob.token}`)
      .send({ title: 'piraté' });
    expect(bobUpdate.status).toBe(404);

    const bobDelete = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${bob.token}`);
    expect(bobDelete.status).toBe(404);

    const stillThere = await Task.findById(taskId);
    expect(stillThere).not.toBeNull();
    expect(stillThere.title).toBe('Tâche privée d\'Alice');
  });
});

describe('Isolation des données entre élèves — Notes', () => {
  it('un élève ne peut ni modifier ni supprimer une note d\'un autre', async () => {
    const alice = await createStudentWithToken();
    const bob = await createStudentWithToken();

    const note = await Note.create({ userId: alice.user._id, content: 'Secret d\'Alice' });

    const bobList = await request(app).get('/api/notes').set('Authorization', `Bearer ${bob.token}`);
    expect(bobList.body.find((n) => n._id === note._id.toString())).toBeUndefined();

    const bobUpdate = await request(app)
      .put(`/api/notes/${note._id}`)
      .set('Authorization', `Bearer ${bob.token}`)
      .send({ content: 'piraté' });
    expect(bobUpdate.status).toBe(404);

    const bobDelete = await request(app)
      .delete(`/api/notes/${note._id}`)
      .set('Authorization', `Bearer ${bob.token}`);
    expect(bobDelete.status).toBe(404);

    const stillThere = await Note.findById(note._id);
    expect(stillThere.content).toBe('Secret d\'Alice');
  });
});

describe('Isolation des données entre élèves — Événements', () => {
  it('un élève ne peut ni modifier ni supprimer un événement d\'un autre', async () => {
    const alice = await createStudentWithToken();
    const bob = await createStudentWithToken();

    const event = await Event.create({
      userId: alice.user._id,
      title: 'RDV privé d\'Alice',
      start: new Date(),
      end: new Date(Date.now() + 60 * 60 * 1000),
    });

    const bobUpdate = await request(app)
      .put(`/api/events/${event._id}`)
      .set('Authorization', `Bearer ${bob.token}`)
      .send({ title: 'piraté' });
    expect(bobUpdate.status).toBe(404);

    const bobDelete = await request(app)
      .delete(`/api/events/${event._id}`)
      .set('Authorization', `Bearer ${bob.token}`);
    expect(bobDelete.status).toBe(404);

    const stillThere = await Event.findById(event._id);
    expect(stillThere.title).toBe('RDV privé d\'Alice');
  });
});
