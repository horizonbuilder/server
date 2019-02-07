import 'jest';
import server from '../../app';
import knex from '../../db/connection';
import * as request from 'supertest';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

describe('routes : auth', () => {
  beforeAll(() => {
    return knex.migrate
      .rollback({ directory: 'src/migrations' })
      .then(() => {
        return knex.migrate.latest({ directory: 'src/migrations' });
      })
      .then(() => {
        return knex.seed.run({ directory: 'src/seeds' });
      });
  });

  afterAll(() => {
    return knex.migrate.rollback({ directory: 'src/migrations' }).then(() => knex.destroy());
  });

  describe('POST /signup', () => {
    it('should return a token and user object', done => {
      request(server)
        .post('/signup')
        .type('form')
        .send('username=tester')
        .send('password=test')
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('token');
          expect(response.body).toHaveProperty('user');
          expect(response.body.user).toHaveProperty('id');
          expect(response.body.user).toHaveProperty('first');
          expect(response.body.user).toHaveProperty('last');
          expect(response.body.user).toHaveProperty('organization_id');
          expect(response.body.user).toHaveProperty('region_id');
          done();
        });
    });
    it('should return an error if username exists', done => {
      request(server)
        .post('/signup')
        .type('form')
        .send('username=tester')
        .send('password=test')
        .expect(403)
        .then(response => {
          expect(response.body).toHaveProperty('error');
          done();
        });
    });
  });

  describe('POST /signup/invite', () => {

    it('should invite user', done => {
      request(server)
        .post('/signup/invite')
        .send({
          username: "test_3",
          password: "test_3",
          email: "test_3@gmail.com",
          role: "appraisal",
          region_id: 1,
          organization_id: 1,
          is_admin: true
        })
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('status');
          expect(response.body).toHaveProperty('id');

          done();
        });
    });

  });

  describe('POST /login', () => {
    it('should return a token and user object', done => {
      request(server)
        .post('/login')
        .send('username=tester')
        .send('password=test')
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('token');
          expect(response.body).toHaveProperty('user');
          expect(response.body.user).toHaveProperty('id');
          expect(response.body.user).toHaveProperty('first');
          expect(response.body.user).toHaveProperty('last');
          expect(response.body.user).toHaveProperty('organization_id');
          expect(response.body.user).toHaveProperty('region_id');
          done();
        });
    });
    it('should return error if user not found', done => {
      request(server)
        .post('/login')
        .send('username=notauser')
        .send('password=test')
        .expect(401)
        .then(response => {
          expect(response.body).toHaveProperty('error');
          done();
        });
    });
    it('should return error if password is incorrect', done => {
      request(server)
        .post('/login')
        .send('username=test')
        .send('password=wrongpassword')
        .expect(401)
        .then(response => {
          expect(response.body).toHaveProperty('error');
          done();
        });
    });
  });
});
