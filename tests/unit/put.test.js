// tests/unit/getById.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
    // If unauthorized, return 401
    test('unauthenticated requests are denied', () => request(app).put('/v1/fragments/123').expect(401));

    // Updating fragment that does not exist return 404
    test('Update fragment that does not exist', async () => {
        const res = await request(app)
            .put('/v1/fragments/123').auth('user1@email.com', 'password1')
            .set('Content-Type', 'text/plain').send('Test fragment');

        expect(res.statusCode).toBe(404);
    });

    // Updating fragment with different content-type
    test('Update text/plain fragment', async () => {
    
        const res = await request(app)
            .post('/v1/fragments').auth('user1@email.com', 'password1')
            .set('Content-Type', 'text/plain').send('Test fragment');

        expect(res.statusCode).toBe(201);

        const fragmentId = JSON.parse(res.text).fragment.id;

        const putRes = await request(app)
        .put(`/v1/fragments/${fragmentId}`).auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/html').send('<p>Testfragment</p>');

        expect(putRes.statusCode).toBe(400);

    });

    // Updating fragment
    test('Update text/plain fragment', async () => {
        
        const res = await request(app)
            .post('/v1/fragments').auth('user1@email.com', 'password1')
            .set('Content-Type', 'text/plain').send('Test fragment');

        expect(res.statusCode).toBe(201);
        expect(res.body.fragment.size).toBe(13);
        const fragmentId = JSON.parse(res.text).fragment.id;

        const putRes = await request(app)
        .put(`/v1/fragments/${fragmentId}`).auth('user1@email.com', 'password1')
        .set('Content-Type', 'text/plain').send('Testfragment');

        expect(putRes.statusCode).toBe(200);
        expect(putRes.body.fragment.size).toBe(12);

    });


});