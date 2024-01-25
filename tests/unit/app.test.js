// tests/unit/app.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('404 Handler', () => {
  it('should return a 404 status and error message', async () => {
    const response = await request(app).get('/nonexistent-route');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        message: 'not found',
        code: 404,
      },
    });
  });
});
