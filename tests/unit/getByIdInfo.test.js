// tests/unit/getByIdInfo.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id/info', () => {
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

    // Attempt to use GET /fragments/:id/info to obtain metadata for test fragment
    test('returns metadata for a valid fragment ID', async () => {
    // POST a fragment to obtain its ID
    const postResponse = await request(app)
        .post('/v1/fragments').auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain').send('Test fragment');
    expect(postResponse.statusCode).toBe(201);

    const fragmentId = JSON.parse(postResponse.text).fragment.id;

    const getResponse = await request(app)
        .get(`/v1/fragments/${fragmentId}/info`)
        .auth('user1@email.com', 'password1');

    console.log("getResponse: " + getResponse.text);
    // Assert response
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(getResponse.body.status).toBe('ok');
    expect(getResponse.body.fragment.id).toBe(fragmentId);

    expect(getResponse.body.fragment.type).toBe('text/plain');
    expect(getResponse.body.fragment.size).toBe(13);
    expect(new Date(getResponse.body.fragment.created)).toBeInstanceOf(Date);
    expect(new Date(getResponse.body.fragment.updated)).toBeInstanceOf(Date);
    
    });
    
});