const request = require('supertest');

describe('GET /api/roles', () => {
  it('should return a list of roles', async () => {
    const response = await request('http://localhost:5001')
      .get('/api/roles')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toHaveProperty('_id');
    expect(response.body[0]).toHaveProperty('name');
  });
});