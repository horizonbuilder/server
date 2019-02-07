import * as express from 'express';
import knex from '../db/connection';
import authHelpers from '../auth/_helpers';
import routeHelpers from './_helpers';

const router = express.Router();
/**
 * @swagger
 * definitions:
 *   Order:
 *     properties:
 *       id:
 *         type: integer
 *       services:
 *         type: Array
 */

/**
 * @swagger
 *  /jobs/{job_id}/orders:
 *  get:
 *    tags:
 *    - orders
 *    summary: gets a list of all orders for a job, the user must own this job
 *    security:
 *      - Bearer: []
 *    produces:
 *    - application/json
 *    parameters:
 *      - name: job_id
 *        in: path
 *        description: The id of the job
 *        required: true
 *        type: integer
 *        example: 1
 *    responses:
 *      200:
 *        description: array of orders
 *        schema:
 *          $ref: '#/definitions/Order'
 */
router.get('/:job_id/orders', authHelpers.ensureAuthenticated, async (req, res) => {
  let job_id = req.params.job_id;

  try {
    let orders = await knex('orders')
      .select('*')
      .where({ job_id });

    if (orders.length) {
      res.status(200).json(orders);
    } else {
      res.status(404).json(`no orders found for job ${job_id}`);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

/**
 * @swagger
 *  /jobs/{job_id}/orders:
 *  post:
 *    tags:
 *    - orders
 *    summary: add a order to a job, the user must own this job
 *    security:
 *      - Bearer: []
 *    produces:
 *    - application/json
 *    consumes:
 *    - application/json
 *    parameters:
 *      - name: job_id
 *        in: path
 *        description: The id of the job
 *        required: true
 *        type: integer
 *        example: 1
 *    responses:
 *      200:
 *        description: successful operation
 *        schema:
 *          $ref: '#/definitions/Order'
 */
router.post('/:job_id/orders', authHelpers.ensureAuthenticated, async (req, res) => {
  let job_id = req.params.job_id;

  let job = await knex('jobs')
    .where({ id: job_id })
    .first();

  if (job) {
    try {
      let order = await knex('orders').insert({ job_id });
      res.status(200).json(order);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err.message);
    }
  } else {
    res.status(400).json({ error: `job ${job_id} does not exist` });
  }
});

/**
 * @swagger
 *  /jobs/{job_id}/orders/{order_id}:
 *  delete:
 *    tags:
 *    - orders
 *    summary: delete an order, the user must own this job
 *    security:
 *      - Bearer: []
 *    produces:
 *    - application/json
 *    parameters:
 *      - name: job_id
 *        in: path
 *        description: The id of the job
 *        required: true
 *        type: integer
 *        example: 1
 *      - name: order_id
 *        in: path
 *        description: The id of the order
 *        required: true
 *        type: integer
 *        example: 1
 *    responses:
 *      200:
 *        description: successful operation
 *      400:
 *        description: order does not exist
 */
router.delete('/:job_id/orders/:order_id', authHelpers.ensureAuthenticated, async (req, res) => {
  let job_id = req.params.job_id;
  let order_id = req.params.order_id;

  let deletedOrder = await knex('orders')
    .where({ job_id, id: order_id })
    .delete();

  if (deletedOrder) {
    res.status(200).json(`successfully deleted order ${order_id}`);
  } else {
    res.status(400).json({ error: `order ${order_id} does not exist` });
  }
});

export default router;
