// tests/unit/getById.test.js
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id.:ext?', () => {
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

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.headers['content-type']).toBe('text/plain');
    expect(getResponse.text).toEqual('Test fragment');

    });

    // Attempt to convert md to html using GET:id.:ext
    test('Converting MD to HTML successfully', async () => {
        // POST a fragment to obtain its ID
        const postResponse = await request(app)
            .post('/v1/fragments').auth('user1@email.com', 'password1')
            .set('Content-Type', 'text/markdown').send('# Test fragment');
        expect(postResponse.statusCode).toBe(201);
    
        const fragmentId = JSON.parse(postResponse.text).fragment.id;
    
        const getResponse = await request(app)
            .get(`/v1/fragments/${fragmentId}.html`)
            .auth('user1@email.com', 'password1');
    
        // Assert response
        expect(getResponse.statusCode).toBe(200);
        expect(getResponse.headers['content-type']).toContain('text/html');
        expect(getResponse.text).toContain('<h1>Test fragment</h1>');
    });

    // Attempt to convert md to image using GET:id.:ext, expecting error
    test('Converting MD to unsupported type', async () => {
        // POST a fragment to obtain its ID
        const postResponse = await request(app)
            .post('/v1/fragments').auth('user1@email.com', 'password1')
            .set('Content-Type', 'text/markdown').send('# Test fragment');
        expect(postResponse.statusCode).toBe(201);
    
        const fragmentId = JSON.parse(postResponse.text).fragment.id;
    
        const getResponse = await request(app)
            .get(`/v1/fragments/${fragmentId}.png`)
            .auth('user1@email.com', 'password1');
    
        // Assert response
        expect(getResponse.statusCode).toBe(415);
    });

    // Attempt to convert md to csv using GET:id.:ext, expecting error
    test('Converting MD to unsupported type', async () => {
        // POST a fragment to obtain its ID
        const postResponse = await request(app)
            .post('/v1/fragments').auth('user1@email.com', 'password1')
            .set('Content-Type', 'text/markdown').send('# Test fragment');
        expect(postResponse.statusCode).toBe(201);
    
        const fragmentId = JSON.parse(postResponse.text).fragment.id;
    
        const getResponse = await request(app)
            .get(`/v1/fragments/${fragmentId}.csv`)
            .auth('user1@email.com', 'password1');
    
        // Assert response
        expect(getResponse.statusCode).toBe(415);
    });

    // Testing pulling image.png from png
    test('Converting image.png to PNG successfully', async () => {
        // Read the image file into a buffer (assuming 'image.png' is located in the test directory)
        const fs = require('fs');
        const path = require('path');
        const imageBuffer = fs.readFileSync(path.join(__dirname, '..', 'resources', 'image.png'));
    
        // POST a fragment to obtain its ID
        const postResponse = await request(app)
            .post('/v1/fragments').auth('user1@email.com', 'password1')
            .set('Content-Type', 'image/png')
            .send(imageBuffer);
    
        console.log("postResponse: " + postResponse);
        expect(postResponse.statusCode).toBe(201);
    
        const fragmentId = JSON.parse(postResponse.text).fragment.id;
    
        // GET the fragment with .png extension
        const getResponse = await request(app)
            .get(`/v1/fragments/${fragmentId}.png`)
            .auth('user1@email.com', 'password1');
    
        // Assert response
        expect(getResponse.statusCode).toBe(200);
        expect(getResponse.headers['content-type']).toContain('image/png');
    });

    // Testing GET image.png and convert to to jpg
    test('Converting image.png to PNG successfully', async () => {
        // Read the image file into a buffer (assuming 'image.png' is located in the test directory)
        const fs = require('fs');
        const path = require('path');
        const imageBuffer = fs.readFileSync(path.join(__dirname, '..', 'resources', 'image.png'));
    
        // POST a fragment to obtain its ID
        const postResponse = await request(app)
            .post('/v1/fragments').auth('user1@email.com', 'password1')
            .set('Content-Type', 'image/png')
            .send(imageBuffer);
    
        console.log("postResponse: " + postResponse);
        expect(postResponse.statusCode).toBe(201);
    
        const fragmentId = JSON.parse(postResponse.text).fragment.id;
    
        // GET the fragment with .png extension
        const getResponse = await request(app)
            .get(`/v1/fragments/${fragmentId}.jpg`)
            .auth('user1@email.com', 'password1');
    
        // Assert response
        expect(getResponse.statusCode).toBe(200);
        expect(getResponse.headers['content-type']).toContain('image/jpg');
    });
            



});