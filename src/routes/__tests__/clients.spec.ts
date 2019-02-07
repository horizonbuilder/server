import 'jest';
import server from '../../app';
import knex from '../../db/connection';
import * as request from 'supertest';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

describe('routes : clients', () => {
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

  describe('GET /clients', () => {
    it('should get all clients', done => {
      request(server)
        .get('/clients')
        .set('Authorization', `Bearer: ${token}`)
        .expect(200)
        .then(response => {
          expect(response.body).toHaveLength(6);
          expect(response.body[0]).toHaveProperty('id');
          expect(response.body[0]).toHaveProperty('name');
          expect(response.body[0]).toHaveProperty('address');
          expect(response.body[0]).toHaveProperty('mobile_phone_number');
          expect(response.body[0]).toHaveProperty('wired_phone_number');
          expect(response.body[0]).toHaveProperty('email_address');
          done();
        });
    });

    it('should return a single client', done => {
      request(server)
        .get('/clients/1')
        .set('Authorization', `Bearer: ${token}`)
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('name');
          expect(response.body).toHaveProperty('address');
          expect(response.body).toHaveProperty('mobile_phone_number');
          expect(response.body).toHaveProperty('wired_phone_number');
          expect(response.body).toHaveProperty('email_address');
          done();
        });
    });

    // it('should not return a client that does not belong to users organization', (done) => {
    //   request(server)
    //   .get('/client/2')
    //   .set('Authorization', `Bearer: ${token}`)
    //   .expect(401, done);
    // });

    it('should return 404 when no client is found', done => {
      request(server)
        .get('/client/99999')
        .set('Authorization', `Bearer: ${token}`)
        .expect(404, done);
    });
  });

  describe('POST /clients', () => {
    it('should add a client', done => {
      request(server)
        .post('/clients')
        .send('name=test client')
        .send('address=test address')
        .send('mobile_phone_number=3084003000')
        .send('mobile_phone_number=3085006000')
        .send('email_address=test@test.com')
        .set('Authorization', `Bearer: ${token}`)
        .expect(200)
        .then(response => {
          expect(response.body).toHaveProperty('name');
          expect(response.body).toHaveProperty('address');
          expect(response.body).toHaveProperty('mobile_phone_number');
          expect(response.body).toHaveProperty('wired_phone_number');
          expect(response.body).toHaveProperty('email_address');
          done();
        });
    });
  });

  describe('PUT /clients/{client_id}', () => {
    it('should update a client', done => {
      request(server)
        .put('/clients/3')
        .set('Authorization', `Bearer: ${token}`)
        .send('name=updated name')
        .send('address=updated address')
        .send('mobile_phone_number=3084003000')
        .send('mobile_phone_number=3085006000')
        .send('email_address=test@test.com')
        .then(response => {
          expect(response.body).toHaveProperty('name');
          expect(response.body).toHaveProperty('address');
          expect(response.body).toHaveProperty('mobile_phone_number');
          expect(response.body).toHaveProperty('wired_phone_number');
          expect(response.body).toHaveProperty('email_address');
          request(server)
            .get('/clients/3')
            .set('Authorization', `Bearer: ${token}`)
            .then(response => {
              expect(response.body.name).toBe('updated name');
              expect(response.body.address).toBe('updated address');
              done();
            });
        });
    });

    it('should only update attributes that are passed', done => {
      request(server)
        .put('/clients/3')
        .set('Authorization', `Bearer: ${token}`)
        .send('name=updated name!!')
        .send('address=updated address!!')
        .then(response => {
          request(server)
            .get('/clients/3')
            .set('Authorization', `Bearer: ${token}`)
            .then(response => {
              expect(response.body.name).toBe('updated name!!');
              expect(response.body.address).toBe('updated address!!');
              done();
            });
        });
    });

    it('should return 400 if a client does not exist', done => {
      request(server)
        .put('/clients/999')
        .send('name=updated name')
        .set('Authorization', `Bearer: ${token}`)
        .expect(400)
        .then(response => {
          expect(response.body).toHaveProperty('error');
          done();
        });
    });

    // it('should return 401 if users organization does not own the client', (done) => {
    //   request(server)
    //   .put('/clients/4')
    //   .set('Authorization', `Bearer: ${token}`)
    //   .expect(401, done);
    // });
  });

  describe('DELETE /clients/{client_id}', () => {
    it('should delete a client', done => {
      request(server)
        .delete('/clients/2')
        .set('Authorization', `Bearer: ${token}`)
        .expect(200)
        .then(response => {
          request(server)
            .get('/clients/2')
            .set('Authorization', `Bearer: ${token}`)
            .expect(404, done);
        });
    });

    it('should return 404 if a client does not exist', done => {
      request(server)
        .delete('/clients/999')
        .set('Authorization', `Bearer: ${token}`)
        .expect(404)
        .then(response => {
          expect(response.body).toHaveProperty('error');
          done();
        });
    });

    // it('should return 401 if users organization does not own the client', (done) => {
    //   request(server)
    //   .delete('/clients/6')
    //   .set('Authorization', `Bearer: ${token}`)
    //   .expect(401, done);
    // });
  });
});
