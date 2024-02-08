// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');
const crypto = require('crypto');
const { Fragment } = require('../../src/model/fragment');

describe('GET /v1/fragments', () => {
  // Hashes ownerId so we can use it to delete Fragment for cleanup
  const ownerId = crypto.createHash('sha256').update('user1@email.com').digest('hex');

  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // Test the content of the fragments array
  test('fragments array contains correct data', async () => {
    // POSTS a single fragment
    const post = await request(app)
    .post('/v1/fragments').auth('user1@email.com', 'password1')
    .set('Content-Type', 'text/plain').send('Test fragment');
    expect(post.statusCode).toBe(201);

    // GETS the fragment and tests if res.body contains a single fragment
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments.length).toBe(1);
    expect(res.body.fragments).toEqual([JSON.parse(post.text).fragment.id]);
    
    // Deletes created fragment for cleanup
    await Fragment.delete(ownerId, res.body.fragments[0]);
    
  });

  // Test the 'expand' functionality
  test('Using expand=1 should return details for all of the users fragments', async () => {
    // POST two fragments for testing 
    const post = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
    .set('Content-Type', 'text/plain').send('Test fragment');
    const post2 = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1')
    .set('Content-Type', 'text/plain').send('Test fragment 2');

    expect(post.statusCode).toBe(201);
    expect(post2.statusCode).toBe(201);

    // GETs the fragments and tests if res.body contains two fragments
    const res = await request(app).get('/v1/fragments?expand=1').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.fragments.length).toBe(2);
    // Verifies that the fragments have the correct sample data
    expect(res.body.fragments[0].type).toBe('text/plain');
    expect(res.body.fragments[1].type).toBe('text/plain');
    //expect(res.body.fragments).toEqual([JSON.parse(post.text).fragment.id, JSON.parse(post2.text).fragment.id]);
    // Deletes created fragments for cleanup
    await Fragment.delete(ownerId, res.body.fragments[0].id);
    await Fragment.delete(ownerId, res.body.fragments[1].id);
  });

});