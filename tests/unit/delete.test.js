// tests/unit/delete.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
    // If unauthorized, return 401
    test('unauthenticated requests are denied', () => request(app).delete('/v1/fragments/123').expect(401));

    // If Fragment doesn't exist, return 404
    test("Fragment doesn't exist, return 404", () => 
        request(app).delete('/v1/fragments/123').auth('user1@email.com', 'password1').expect(404));

    // Authenticated user posts, deletes, and attempts to get fragment
    test('authenticated user delete valid fragment', async () => {
        // POST fragment to be deleted
        const post = await request(app)
            .post('/v1/fragments')
            .auth('user1@email.com', 'password1')
            .set('Content-Type', 'text/plain')
            .send('Test fragment');
        expect(post.statusCode).toBe(201);

        const fragmentId = JSON.parse(post.text).fragment.id;
        console.log("fragmentId: ", fragmentId);

        // GET fragment to ensure POST successful
        const get = await request(app)
            .get(`/v1/fragments/${fragmentId}`)
            .auth('user1@email.com', 'password1');
        expect(get.statusCode).toBe(200);

        // DELETE fragment
        const del = await request(app)
            .delete(`/v1/fragments/${fragmentId}`)
            .auth('user1@email.com', 'password1');
        expect(del.statusCode).toBe(200);

        // GET deleted fragment to ensure deletion
        const get2 = await request(app)
            .get(`/v1/fragments/${fragmentId}`)
            .auth('user1@email.com', 'password1');
        expect(get2.statusCode).toBe(404);
    })
})