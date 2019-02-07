import 'jest';
import authHelpers from '../_helpers';
import knex from '../../db/connection';

describe('auth : _helpers', () => {
  describe('encodeToken()', () => {
    it('should return a token', done => {
      const results = authHelpers.encodeToken({ id: 1 });
      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(10);
      done();
    });
  });

  describe('decodeToken()', () => {
    it('should return a payload', done => {
      const token = authHelpers.encodeToken({ id: 1 });
      expect(token).toBeDefined();
      authHelpers.decodeToken(token, (err, res) => {
        expect(err).toBe(null);
        expect(res).toHaveProperty('exp');
        expect(res).toHaveProperty('iat');
        expect(res).toHaveProperty('sub');
        expect(res.sub).toBe(1);
        done();
      });
    });
  });

  describe('ensureAuthenticated()', () => {
    let mockResponse: any;
    beforeEach(() => {
      mockResponse = {
        status: status => {
          mockResponse.responseCode = status;
          return mockResponse;
        },
        json: json => {
          mockResponse.responseBody = json;
        }
      };
    });

    it('should return 401 if no auth header exists', () => {
      authHelpers.ensureAuthenticated({}, mockResponse, {});
      expect(mockResponse.responseCode).toBe(401);
      expect(mockResponse.responseBody).toBeDefined();
    });

    it('should call decodeToken', () => {
      const token = authHelpers.encodeToken({ id: 1 });
      let req = {
        headers: { authorization: `Bearer ${token}` }
      };

      let spy = jest.spyOn(authHelpers, 'decodeToken');
      authHelpers.ensureAuthenticated(req, mockResponse, {});
      expect(spy).toHaveBeenCalled();
    });

    it('should return 401 if token is expired', () => {
      const token = authHelpers.encodeToken({ id: 1 });
      let req = {
        headers: { authorization: `Bearer ${token}` }
      };
      Date.now = jest.fn(() => 9999999999999);

      authHelpers.ensureAuthenticated(req, mockResponse, {});
      expect(mockResponse.responseCode).toBe(401);
    });

    it('should call next if token is valid', done => {
      const token = authHelpers.encodeToken({ id: 1 });
      let req = {
        headers: { authorization: `Bearer ${token}` }
      };
      knex = () => ({
        where: () => ({
          first: () => {
            return Promise.resolve({});
          }
        })
      });

      authHelpers.ensureAuthenticated(req, mockResponse, done);
    });
  });
});
