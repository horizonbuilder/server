import 'jest';
import server from '../../app';
import knex from '../../db/connection';
import * as request from 'supertest';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

describe('routes : reports', () => {
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
          .post('/login')
          .send('username=test')
          .send('password=test')
          .then(res => (token = res.body.token));
      });
  });

  afterAll(() => {
    return knex.migrate.rollback({ directory: 'src/migrations' }).then(() => knex.destroy());
  });

  describe('GET /workfiles/{workfile_id}/reports', () => {
    it('should get all reports for a workfile', done => {
      request(server)
        .get('/workfiles/1/reports')
        .set('Authorization', `Bearer: ${token}`)
        .expect(200)
        .then(response => {
          expect(response.body).toHaveLength(1);
          expect(response.body[0]).toHaveProperty('id');
          expect(response.body[0]).toHaveProperty('workfile_id');
          expect(response.body[0]).toHaveProperty('report');
          done();
        });
    });

    it('should return 404 when no reports are found', done => {
      request(server)
        .get('/workfiles/99999/reports')
        .set('Authorization', `Bearer: ${token}`)
        .expect(404, done);
    });

    it('should return 401 if users organization does not own the workfile', done => {
      request(server)
        .get('/workfiles/6/reports')
        .set('Authorization', `Bearer: ${token}`)
        .expect(401, done);
    });
  });

  describe('POST /workfiles/{workfile_id}/reports', () => {
    it('should update or add a report', done => {
      request(server)
        .post('/workfiles/1/reports')
        .set('Authorization', `Bearer: ${token}`)
        .send({
          workfile_id: '1',
          report: '<h1>new report</h1>'
        })
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('workfile_id');
          expect(response.body).toHaveProperty('report');
          done();
        });
    });

    it('should return 401 if users organization does not own the workfile', done => {
      request(server)
        .post('/workfiles/6/reports')
        .set('Authorization', `Bearer: ${token}`)
        .expect(401, done);
    });
  });
});
