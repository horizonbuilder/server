import * as express from 'express';
import * as R from 'ramda';

import authHelpers from '../auth/_helpers';

const router = express.Router();
const passport = require('../auth/passport');

/**
 * @swagger
 *  /login:
 *  post:
 *    tags:
 *    - auth
 *    summary: "Logs user into the system"
 *    produces:
 *    - application/json
 *    consumes:
 *    - application/json
 *    parameters:
 *      - name: user
 *        in: body
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            username:
 *              example: test
 *            password:
 *              example: test
 *    responses:
 *      200:
 *        description: "successful operation"
 *        schema:
 *          type: "string"
 *        headers:
 *          X-Expires-After:
 *            type: "string"
 *            format: "date-time"
 *            description: "date in UTC when token expires"
 *      400:
 *        description: "Invalid username/password supplied"
 */
router.post('/login', function(req: any, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      handleResponse(res, 500, { error: err });
    }
    if (!user) {
      handleResponse(res, 401, { error: info });
    }
    if (user) {
      const userObj = R.omit(['password', 'token'], user);

      res.status(200).json({
        status: 'success',
        user: userObj,
        token: user.token
      });
    }
  })(req, res, next);
});

/**
 * @swagger
 *  /signup:
 *  post:
 *    tags:
 *    - auth
 *    summary: "Signup a new user"
 *    produces:
 *    - application/json
 *    consumes:
 *    - application/json
 *    parameters:
 *      - name: user
 *        in: body
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            username:
 *              example: test
 *            password:
 *              example: test
 *    responses:
 *      200:
 *        description: "successful operation"
 *        schema:
 *          type: "string"
 *      400:
 *        description: "Invalid username/password supplied"
 */
router.post('/signup', function(req, res, next) {
  return authHelpers
    .createUser(req)
    .then(user => {
      return authHelpers.encodeToken(user[0]);
    })
    .then(token => {
      passport.authenticate('local', (err, user, info) => {
        if (user) {
          const userObj = R.omit(['password', 'token'], user);
          
          res.status(200).json({
            status: 'success',
            user: userObj,
            token: token
          });
        }
      })(req, res, next);
    })
    .catch(err => {
      handleResponse(res, err.status || 500, { error: err.message || err });
    });
});

/**
 * @swagger
 *  /signup/invite:
 *  post:
 *    tags:
 *    - auth
 *    summary: "Invite a new user"
 *    produces:
 *    - application/json
 *    consumes:
 *    - application/json
 *    parameters:
 *      - name: user
 *        in: body
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            username:
 *              example: test
 *            password:
 *              example: test
 *            email:
 *              example: test@test.com
 *            is_admin:
 *              type: boolean
 *              example: true
 *            role:
 *              type: string
 *              example: appraisal
 *              enum:
 *                - appraisal
 *                - trainee
 *                - appraisal_workfile_manager
 *                - staff
 *    responses:
 *      200:
 *        description: "successful operation"
 *        schema:
 *          type: "string"
 */
router.post('/signup/invite', async (req, res, done) => {
  try {
    const [user] = await authHelpers.createUser(req);

    res.status(200).json({ status: 'success', id: user.id });
  } catch(err) {
    handleResponse(res, err.status || 500, { error: err.message || err });
  }
});

function handleResponse(res, code, statusMsg) {
  res.status(code).json(statusMsg);
}

export default router;
