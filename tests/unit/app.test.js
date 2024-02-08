// tests/unit/app.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('404 Handler', () => {
  test('should return a 404 status and error message', async () => {
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

// Mock the logger
const mockLogger = {
  info: jest.fn(),
};

describe('printEnvironmentVariables', () => {
  afterEach(() => {
    // Clear the mock calls after each test
    mockLogger.info.mockClear();
  });

  test('should log environment variables when LOG_LEVEL is debug', () => {
    process.env.LOG_LEVEL = 'debug';
    app.prototype.printEnvironmentVariables.call(app, mockLogger);

    expect(mockLogger.info).toHaveBeenCalled();
    expect(mockLogger.info.mock.calls[0][0]).toBe('Environment variables:');
  });

  test('should not log environment variables when LOG_LEVEL is not debug', () => {
    process.env.LOG_LEVEL = 'info';
    app.prototype.printEnvironmentVariables.call(app, mockLogger);

    expect(mockLogger.info).not.toHaveBeenCalled();
  });
});