import 'jest';
import server from '../../app';
import knex from '../../db/connection';
import * as request from 'supertest';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

describe('routes : users', () => {
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

  describe('GET /users', () => {
    it('should get a user', done => {
      request(server)
        .get('/users')
        .set('Authorization', `Bearer: ${token}`)
        .expect(200, done);
    });

    it('should get users by region id', done => {
      request(server)
        .get('/users?region_id=1')
        .set('Authorization', `Bearer: ${token}`)
        .expect(200, done);
    });

    it('should get users by organization id', done => {
      request(server)
        .get('/users?organization_id=1')
        .set('Authorization', `Bearer: ${token}`)
        .expect(200, done);
    });
  });

  describe('PUT /users/{user_id}', () => {
    it('should update a user', done => {
      request(server)
        .put('/users/1')
        .set('Authorization', `Bearer: ${token}`)
        .send({ first: 'updated', last: 'updated', organization_id: 2 })
        .expect(200)
        .then(response => {
          expect(response.body.first).toBe('updated');
          expect(response.body.last).toBe('updated');
          expect(response.body.organization_id).toBe(2);
          done();
        });
    });

    it('should only update attributes that are passed', done => {
      request(server)
        .put('/users/2')
        .set('Authorization', `Bearer: ${token}`)
        .send({ organization_id: 2 })
        .expect(200)
        .then(response => {
          expect(response.body.first).toBe('test first2');
          expect(response.body.last).toBe('test last2');
          expect(response.body.organization_id).toBe(2);
          done();
        });
    });

    it('should return an error if organization does not exist', done => {
      request(server)
        .put('/users/1')
        .set('Authorization', `Bearer: ${token}`)
        .send({ organization_id: 666 })
        .expect(400, done);
    });
  });
});
