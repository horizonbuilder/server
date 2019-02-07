import * as express from 'express';
import knex from '../db/connection';
import authHelpers from '../auth/_helpers';
import routeHelpers from './_helpers';

const router = express.Router();
/**
 * @swagger
 * definitions:
 *   Service:
 *     properties:
 *       id:
 *         type: integer
 *       materials:
 *         type: Array
 *       labor:
 *         type: Array
 */

/**
 * @swagger
 *  /jobs/{job_id}/estimates/{estimate_id}/services:
 *  get:
 *    tags:
 *    - services
 *    summary: gets a list of all services for a job, the user must own this job
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
 *      - name: estimate_id
 *        in: path
 *        description: The id of the estimate
 *        required: true
 *        type: integer
 *        example: 1
 *    responses:
 *      200:
 *        description: array of services
 *        schema:
 *          $ref: '#/definitions/Service'
 */
router.get(
  '/:job_id/estimates/:estimate_id/services',
  authHelpers.ensureAuthenticated,
  async (req, res) => {
    let job_id = req.params.job_id;
    let estimate_id = req.params.estimate_id;

    try {
      let services = await knex('services')
        .select('*')
        .join('trades', 'trades.id', '=', 'services.trade_id')
        .where('trades.estimate_id', estimate_id);

      if (services.length) {
        res.status(200).json(services);
      } else {
        res.status(404).json(`no services found for job ${job_id}`);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json(err.message);
    }
  }
);

/**
 * @swagger
 *  /jobs/{job_id}/services:
 *  post:
 *    tags:
 *    - services
 *    summary: add a service to a job, the user must own this job
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
 *      - name: service
 *        in: body
 *        required: true
 *        schema:
 *         type: object
 *         properties:
 *           name:
 *             example: service name
 *           trade_id:
 *             example: 1
 *           order_id:
 *             example: 1
 *    responses:
 *      200:
 *        description: successful operation
 *        schema:
 *          $ref: '#/definitions/Service'
 */
router.post('/:job_id/services/', authHelpers.ensureAuthenticated, async (req, res) => {
  let job_id = req.params.job_id;
  let values: any = routeHelpers.filterBody(req.body, ['name', 'trade_id', 'order_id']);

  let job = await knex('jobs')
    .where({ id: job_id })
    .first();

  if (job) {
    try {
      let service = await knex('services').insert(values);
      res.status(200).json(service);
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
 *  /jobs/{job_id}/services:
 *  put:
 *    tags:
 *    - services
 *    summary: update a service, the user must own this job
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
 *      - name: service_id
 *        in: path
 *        description: The id of the service
 *        required: true
 *        type: integer
 *        example: 1
 *      - name: service
 *        in: body
 *        required: true
 *        schema:
 *         type: object
 *         properties:
 *           name:
 *             example: service name
 *           trade_id:
 *             example: 1
 *           order_id:
 *             example: 1
 *    responses:
 *      200:
 *        description: successful operation
 *        schema:
 *          $ref: '#/definitions/Service'
 */
router.put(
  '/:job_id/services/:service_id',
  authHelpers.ensureAuthenticated,
  routeHelpers.checkUserOwnsJob,
  async (req, res) => {
    let job_id = req.params.job_id;
    let service_id = req.params.service_id;

    let values: any = routeHelpers.filterBody(req.body, ['name', 'trade_id', 'order_id']);

    let service = await knex('services')
      .where({ id: service_id })
      .first();

    if (service) {
      try {
        let updateService = await knex('services')
          .update(values)
          .where({ id: service_id });

        res.status(200).json(updateService);
      } catch (err) {
        console.log(err);
        return res.status(500).json(err.message);
      }
    } else {
      res.status(400).json({ error: `service ${service_id} does not exist` });
    }
  }
);

/**
 * @swagger
 *  /jobs/{job_id}/services/{service_id}:
 *  delete:
 *    tags:
 *    - services
 *    summary: delete an service, the user must own this job
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
 *      - name: service_id
 *        in: path
 *        description: The id of the service
 *        required: true
 *        type: integer
 *        example: 1
 *    responses:
 *      200:
 *        description: successful operation
 *      400:
 *        description: service does not exist
 */
router.delete(
  '/:job_id/services/:service_id',
  authHelpers.ensureAuthenticated,
  async (req, res) => {
    let job_id = req.params.job_id;
    let service_id = req.params.service_id;

    let deletedService = await knex('services')
      .where({ id: service_id })
      .delete();

    if (deletedService) {
      res.status(200).json(`successfully deleted service ${service_id}`);
    } else {
      res.status(400).json({ error: `service ${service_id} does not exist` });
    }
  }
);

export default router;
