// tests/unit/getById.test.js

const request = require('supertest');
const app = require('../../src/app');
const crypto = require('crypto');
const { Fragment } = require('../../src/model/fragment');

describe('GET /v1/fragments/:id', () => {
    // If the request is missing the Authorization header, it should be forbidden
    test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

    // If the wrong username/password pair are used (no such user), it should be forbidden
    test('incorrect credentials are denied', () =>
        request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

    // Attempt to GET:id a fragment with an invalid ID
    test('returns 404 for an invalid fragment ID', async () => {
        const getResponse = await request(app)
          .get('/v1/fragments/invalid_id').auth('user1@email.com', 'password1');
        expect(getResponse.statusCode).toBe(404);
      });

    // Attempt to GET:id a fragment with a valid ID
    test('returns data for a valid fragment ID', async () => {
    // POST a fragment to obtain its ID
    const postResponse = await request(app)
        .post('/v1/fragments').auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain').send('Test fragment');
    expect(postResponse.statusCode).toBe(201);

    const fragmentId = JSON.parse(postResponse.text).fragment.id;

    const getResponse = await request(app)
        .get(`/v1/fragments/${fragmentId}`)
        .auth('user1@email.com', 'password1');

    // Assert response
    console.log("getResponse: ", getResponse.text);
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.headers['content-type']).toBe('text/plain');
    expect(getResponse.text).toEqual('Test fragment');

    });
    
});