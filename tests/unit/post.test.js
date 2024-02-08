// tests/unit/post.test.js

const request = require('supertest');
const crypto = require('crypto');
const app = require('../../src/app');

describe('POST /fragments route', () => {

    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.ENV = { ...OLD_ENV };
    });

    // If the request is missing the Authorization header, it should be forbidden
    test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

    // If the wrong username/password pair are used (no such user), it should be forbidden
    test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

    // Valid username/password, and valid plain text fragment.
    // Expecting the fragment returned with the location, status, and fragment
    test('authenticated users creates new fragment', async () => {
        // POSTs request
        const res = await request(app)
            .post('/v1/fragments').auth('user1@email.com', 'password1')
            .set('Content-Type', 'text/plain').send('Test fragment');

        // Hashes ownerId so we can check if it matches fragment output
        const ownerId = crypto.createHash('sha256').update('user1@email.com').digest('hex');

        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe('ok');
        expect(res.body.fragment).toEqual(expect.objectContaining({
            id: expect.any(String),
            ownerId: ownerId,
            created: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
            updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
            type: 'text/plain',
            size: 13,
            }));
        expect(res.headers).toHaveProperty('location');
        expect(res.headers.location).toMatch(`/v1/fragments/${res.body.fragment.id}`);
        expect(res.headers).toHaveProperty('content-length');
        expect(`${res.headers['content-length']}`).toMatch(`253`);
    });

    // Invalid fragment type sent. Expecting error code 415: Unsupported Media Type
    test('invalid fragment type', async () => {
        const res = await request(app)
            .post('/v1/fragments').auth('user1@email.com', 'password1')
            .set('Content-Type', 'audio/webm').send('Test fragment');
    
        expect(res.statusCode).toBe(415);
        expect(res.body.status).toBe('error');
        expect(res.body.error.message).toBe('Unsupported Media Type');
    });


    // Testing different API_URL usage. Expecting location header to change
    test('Location header uses API_URL', async () => {
        process.env.API_URL = 'fragment-test.com';
        const res = await request(app)
            .post('/v1/fragments').auth('user1@email.com', 'password1')
            .set('Content-Type', 'text/plain').send('Test fragment');
    
        expect(res.headers.location).toMatch(`fragment-test.com/v1/fragments/${res.body.fragment.id}`);
        });
  
})