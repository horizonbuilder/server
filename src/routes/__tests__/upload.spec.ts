import 'jest';
import server from '../../app';
import knex from '../../db/connection';
import * as request from 'supertest';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

describe('routes : upload', () => {
  let token = '';

  beforeAll(() => {
    return knex.migrate
      .rollback({ directory: 'src/migrations' })
      .then(() => {
        return knex.migrate.latest({ directory: 'src/migrations' });
      })
      .then(() => {
        return knex.seed.run({ directory: 'src/seeds' });
      })
      .then(() => {
        return request(server)
          .post('/signup')
          .send('username=tester')
          .send('password=test')
          .then(res => (token = res.body.token));
      });
  });

  afterAll(() => {
    return knex.migrate.rollback({ directory: 'src/migrations' }).then(() => knex.destroy());
  });

  describe('GET /upload', () => {
    it('should return a signed AWS request and file url', done => {
      request(server)
        .get('/upload')
        .set('Authorization', `Bearer: ${token}`)
        .query({ 'file-name': 'testFile.jpg' })
        .query({ 'file-type': '.jpg' })
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('signedRequest');
          expect(response.body).toHaveProperty('url');
          done();
        });
    });
  });
});
