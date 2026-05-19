const request = require('supertest');
const app = require('../src/server');
const { createUser, getToken, createTask } = require('./helpers');

let token;
let otherToken;

beforeEach(async () => {
  await createUser('userA', 'password123');
  await createUser('userB', 'password123');
  token = await getToken(app, 'userA', 'password123');
  otherToken = await getToken(app, 'userB', 'password123');
});

// ── GET /api/tasks ──────────────────────────────────────────────────────────
describe('GET /api/tasks', () => {
  test('7 - no token returns 401', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  test('8 - valid token with no tasks returns empty list', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  test('9 - only returns authenticated user tasks', async () => {
    await createTask(app, token, { title: 'My task' });
    await createTask(app, otherToken, { title: 'Other user task' });

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('My task');
  });

  test('10 - pagination with page=2 and limit=3', async () => {
    for (let i = 1; i <= 5; i++) {
      await createTask(app, token, { title: `Task ${i}` });
    }

    const res = await request(app)
      .get('/api/tasks?page=2&limit=3')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(3);
  });

  test('11 - filter by status=completed', async () => {
    await createTask(app, token, { title: 'Done', status: 'completed' });
    await createTask(app, token, { title: 'Pending', status: 'pending' });

    const res = await request(app)
      .get('/api/tasks?status=completed')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe('completed');
  });

  test('12 - filter by priority=high', async () => {
    await createTask(app, token, { title: 'Urgent', priority: 'high' });
    await createTask(app, token, { title: 'Normal', priority: 'low' });

    const res = await request(app)
      .get('/api/tasks?priority=high')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].priority).toBe('high');
  });

  test('13 - search matches title and description', async () => {
    await createTask(app, token, { title: 'Grocery shopping' });
    await createTask(app, token, { title: 'Exercise', description: 'grocery list review' });
    await createTask(app, token, { title: 'Sleep' });

    const res = await request(app)
      .get('/api/tasks?search=grocery')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });
});

// ── POST /api/tasks ──────────────────────────────────────────────────────────
describe('POST /api/tasks', () => {
  test('14 - no token returns 401', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Task' });
    expect(res.status).toBe(401);
  });

  test('15 - valid body creates task with userId', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'New task', priority: 'high', status: 'pending' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('New task');
    expect(res.body.data).toHaveProperty('userId');
  });

  test('16 - missing title returns 422', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'pending' });

    expect(res.status).toBe(422);
    expect(res.body.details.errors.some(e => e.field === 'title')).toBe(true);
  });

  test('17 - invalid status value returns 422', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task', status: 'done' });

    expect(res.status).toBe(422);
    expect(res.body.details.errors.some(e => e.field === 'status')).toBe(true);
  });

  test('18 - invalid priority value returns 422', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Task', priority: 'urgent' });

    expect(res.status).toBe(422);
    expect(res.body.details.errors.some(e => e.field === 'priority')).toBe(true);
  });
});

// ── GET /api/tasks/:id ───────────────────────────────────────────────────────
describe('GET /api/tasks/:id', () => {
  test('19 - no token returns 401', async () => {
    const res = await request(app).get('/api/tasks/123456789012345678901234');
    expect(res.status).toBe(401);
  });

  test('20 - own task returns 200', async () => {
    const task = await createTask(app, token);

    const res = await request(app)
      .get(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(task._id);
  });

  test('21 - non-existent ID returns 404', async () => {
    const res = await request(app)
      .get('/api/tasks/123456789012345678901234')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  test('22 - another user task returns 403', async () => {
    const task = await createTask(app, otherToken);

    const res = await request(app)
      .get(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

// ── PUT /api/tasks/:id ───────────────────────────────────────────────────────
describe('PUT /api/tasks/:id', () => {
  test('23 - no token returns 401', async () => {
    const res = await request(app)
      .put('/api/tasks/123456789012345678901234')
      .send({ title: 'X', status: 'pending', priority: 'low' });
    expect(res.status).toBe(401);
  });

  test('24 - full valid body replaces task', async () => {
    const task = await createTask(app, token, { title: 'Original', status: 'pending' });

    const res = await request(app)
      .put(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Replaced', status: 'completed', priority: 'high' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Replaced');
    expect(res.body.data.status).toBe('completed');
  });

  test('25 - missing title returns 422', async () => {
    const task = await createTask(app, token);

    const res = await request(app)
      .put(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'pending', priority: 'low' });

    expect(res.status).toBe(422);
    expect(res.body.details.errors.some(e => e.field === 'title')).toBe(true);
  });

  test('26 - another user task returns 403', async () => {
    const task = await createTask(app, otherToken);

    const res = await request(app)
      .put(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Hijack', status: 'pending', priority: 'low' });

    expect(res.status).toBe(403);
  });

  test('27 - non-existent ID returns 404', async () => {
    const res = await request(app)
      .put('/api/tasks/123456789012345678901234')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'X', status: 'pending', priority: 'low' });

    expect(res.status).toBe(404);
  });
});

// ── PATCH /api/tasks/:id ─────────────────────────────────────────────────────
describe('PATCH /api/tasks/:id', () => {
  test('28 - no token returns 401', async () => {
    const res = await request(app)
      .patch('/api/tasks/123456789012345678901234')
      .send({ status: 'completed' });
    expect(res.status).toBe(401);
  });

  test('29 - partial update changes only the specified field', async () => {
    const task = await createTask(app, token, { title: 'Keep title', status: 'pending' });

    const res = await request(app)
      .patch(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.title).toBe('Keep title');
  });

  test('30 - invalid field value returns 422', async () => {
    const task = await createTask(app, token);

    const res = await request(app)
      .patch(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'invalid_status' });

    expect(res.status).toBe(422);
    expect(res.body.details.errors.some(e => e.field === 'status')).toBe(true);
  });

  test('31 - another user task returns 403', async () => {
    const task = await createTask(app, otherToken);

    const res = await request(app)
      .patch(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(403);
  });

  test('32 - non-existent ID returns 404', async () => {
    const res = await request(app)
      .patch('/api/tasks/123456789012345678901234')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(404);
  });
});

// ── DELETE /api/tasks/:id ────────────────────────────────────────────────────
describe('DELETE /api/tasks/:id', () => {
  test('33 - no token returns 401', async () => {
    const res = await request(app).delete('/api/tasks/123456789012345678901234');
    expect(res.status).toBe(401);
  });

  test('34 - own task returns 204 with empty body', async () => {
    const task = await createTask(app, token);

    const res = await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  test('35 - deleted task GET returns 404', async () => {
    const task = await createTask(app, token);

    await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  test('36 - another user task returns 403', async () => {
    const task = await createTask(app, otherToken);

    const res = await request(app)
      .delete(`/api/tasks/${task._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  test('37 - non-existent ID returns 404', async () => {
    const res = await request(app)
      .delete('/api/tasks/123456789012345678901234')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
