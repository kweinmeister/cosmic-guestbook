const request = require('supertest');
const app = require('./server');

describe('Guestbook API', () => {
  it('GET /api/entries returns an array of entries', async () => {
    const res = await request(app).get('/api/entries');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/entries adds a new entry', async () => {
    const newEntry = { name: "Test User", message: "Hello world" };
    const res = await request(app).post('/api/entries').send(newEntry);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', newEntry.name);
    expect(res.body).toHaveProperty('message', newEntry.message);
  });

  it('POST /api/entries without name returns 400', async () => {
    const newEntry = { message: "Hello without name" };
    const res = await request(app).post('/api/entries').send(newEntry);
    expect(res.statusCode).toEqual(400);
  });
});
