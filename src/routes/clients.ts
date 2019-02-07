import * as express from 'express';
import knex from '../db/connection';
import authHelpers from '../auth/_helpers';
import routeHelpers from './_helpers';
const router = express.Router();
/**
 * @swagger
 * definitions:
 *   Client:
 *     properties:
 *       id:
 *         type: integer
 *       name:
 *         type: string
 *       address:
 *         type: string
 *       phone:
 *         type: string
 *       email:
 *         type: string
 */

/**
 * @swagger
 * /clients:
 *   get:
 *     tags:
 *     - clients
 *     summary: Returns all clients.
 *     security:
 *       - Bearer: []
 *     produces:
 *     - application/json
 *     description: Gets a list of all clients
 *     responses:
 *       200:
 *         description: Array of all clients
 *         schema:
 *           $ref: '#/definitions/Client'
 *       400:
 *         description: No clients found.
 */
router.get('/', authHelpers.ensureAuthenticated, async (req: any, res, next) => {
  try {
    let clients = await knex('clients').select('*');
    if (clients) {
      res.status(200).json(clients);
    } else {
      res.status(400).json(`No clients were found.`);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @swagger
 * /clients/{client_id}:
 *   get:
 *     tags:
 *     - clients
 *     summary: Returns a specific client.
 *     security:
 *       - Bearer: []
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: client_id
 *         in: path
 *         description: The id of the client
 *         required: true
 *         type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Successful operation, specified client returned
 *         schema:
 *           $ref: '#/definitions/Client'
 *       404:
 *         description: client could not be found
 */
router.get('/:client_id?', authHelpers.ensureAuthenticated, async (req, res) => {
  let client_id = req.params.client_id;

  try {
    let client = await knex('clients')
      .where({ id: client_id })
      .first();
    if (client) {
      res.status(200).json(client);
    } else {
      res.status(404).json(`Client id: ${client_id}, not found`);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @swagger
 *  /clients:
 *   post:
 *    tags:
 *    - clients
 *    security:
 *      - Bearer: []
 *    summary: Add a client
 *    produces:
 *    - application/json
 *    consumes:
 *    - application/json
 *    parameters:
 *       - name: client
 *         in: body
 *         required: true
 *         schema:
 *          type: object
 *          properties:
 *            name:
 *              example: Jane Smith
 *            address:
 *              example: 123 Welcome Ave
 *            email:
 *              example: janeS@terraceag.com
 *            phone:
 *              example: 3080000000
 *    responses:
 *      200:
 *        description: successful operation, client added
 *        schema:
 *          $ref: '#/definitions/Client'
 *      400:
 *        description: Client already exists??
 */
router.post('/', authHelpers.ensureAuthenticated, async (req: any, res) => {
  let values = routeHelpers.filterBody(req.body, ['name', 'address', 'email', 'phone']);

  try {
    let client = await knex('clients').insert(values, '*');
    res.status(200).json(client[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @swagger
 *  /clients/{client_id}:
 *   put:
 *    tags:
 *    - clients
 *    security:
 *      - Bearer: []
 *    summary: Update a specific client
 *    produces:
 *    - application/json
 *    consumes:
 *    - application/json
 *    parameters:
 *       - name: client_id
 *         description: The id of the client
 *         in: path
 *         required: true
 *         type: integer
 *         example: 3
 *       - name: client
 *         in: body
 *         required: true
 *         schema:
 *          type: object
 *          properties:
 *            name:
 *              example: Jane Smith
 *            address:
 *              example: 123 Welcome Ave
 *            email:
 *              example: janeS@terraceag.com
 *            phone:
 *              example: 3080000000
 *    responses:
 *      200:
 *        description: successful operation, client updated
 *        schema:
 *          $ref: '#/definitions/Client'
 *      400:
 *        description: Client not found
 */
router.put('/:client_id', authHelpers.ensureAuthenticated, async (req: any, res) => {
  let client_id = req.params.client_id;
  let values = routeHelpers.filterBody(req.body, ['name', 'address', 'email', 'phone']);

  try {
    let client = await knex('clients')
      .where({ id: client_id })
      .first();
    if (client) {
      let updatedClient = await knex('clients')
        .where({ id: client_id })
        .update(values, '*');
      res.status(200).json(updatedClient[0]);
    } else {
      res.status(400).json({ error: `Client id: ${client_id} does not exist.` });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @swagger
 * /clients/{client_id}:
 *   delete:
 *     tags:
 *     - clients
 *     summary: Deletes a specific client.
 *     security:
 *       - Bearer: []
 *     produces:
 *     - application/json
 *     parameters:
 *       - name: client_id
 *         in: path
 *         description: The id of the client
 *         required: true
 *         type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Successful operation, specified client deleted
 *         schema:
 *           $ref: '#/definitions/Client'
 *       404:
 *         description: Client could not be found
 */
router.delete('/:client_id', authHelpers.ensureAuthenticated, async (req, res) => {
  let client_id = req.params.client_id;

  try {
    let client = await knex('clients')
      .where({ id: client_id })
      .delete();
    if (client) {
      res.status(200).json(`Client: ${client_id} successfully deleted.`);
    } else {
      res.status(404).json({ error: `Client: '${client_id}' not found` });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
