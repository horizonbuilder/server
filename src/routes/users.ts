import * as express from 'express';
import * as R from 'ramda';

import knex from '../db/connection';
import authHelpers from '../auth/_helpers';
import routeHelpers from './_helpers';

const router = express.Router();

/**
 * @swagger
 * definitions:
 *   User:
 *     properties:
 *       id:
 *         type: integer
 *       username:
 *         type: string
 *       first:
 *         type: string
 *       last:
 *         type: string
 *       email:
 *         type: string
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - users
 *     security:
 *       - Bearer: []
 *     description: Returns an object of current user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Current user
 *         schema:
 *           $ref: '#/definitions/User'
 */
router.get('/me', authHelpers.ensureAuthenticated, (req: any, res) => {
  const user = R.omit(['password'], req.user);

  res.status(200).json(user);
});

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - users
 *     security:
 *       - Bearer: []
 *     description: Returns all users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: region_id
 *         in: query
 *         type: number
 *     responses:
 *       200:
 *         description: All users
 *         schema:
 *           $ref: '#/definitions/User'
 */
router.get('/', authHelpers.ensureAuthenticated, (req: any, res, next) => {
  let fields = ['users.id', 'users.username', 'users.first', 'users.last', 'users.email'];

  knex('users')
    .select(fields)
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => res.status(500).json({ error: err }));
});

/**
 * @swagger
 * /users/{user_id}:
 *   put:
 *    tags:
 *      - users
 *    security:
 *      - Bearer: []
 *    description: Updates a user
 *    produces:
 *       - application/json
 *    consumes:
 *    - application/json
 *    parameters:
 *      - name: user_id
 *        in: path
 *        required: true
 *        type: integer
 *        example: 1
 *      - name: user
 *        in: body
 *        schema:
 *          type: object
 *          properties:
 *            first:
 *              example: firstname
 *            last:
 *              example: lastname
 *    responses:
 *      200:
 *        description: A single user
 *        schema:
 *          $ref: '#/definitions/User'
 */
router.put('/:user_id', authHelpers.ensureAuthenticated, (req, res) => {
  let values: any = routeHelpers.filterBody(req.body, ['first', 'last']);
  let user_id = req.params.user_id;

  knex('users')
    .where({ id: user_id })
    .update(values, ['id', 'username', 'first', 'last'])
    .then(users => {
      res.status(200).json(users[0]);
    })
    .catch(err => res.status(500).json({ error: err }));
});

export default router;
