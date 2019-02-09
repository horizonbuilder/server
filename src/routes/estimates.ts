import * as express from 'express';
import knex from '../db/connection';
import authHelpers from '../auth/_helpers';
import routeHelpers from './_helpers';

const router = express.Router();
/**
 * @swagger
 * definitions:
 *   Estimate:
 *     properties:
 *       id:
 *         type: integer
 *       services:
 *         type: Array
 *       shipping:
 *         type: float
 *       taxes:
 *         type: float
 */

/**
 * @swagger
 *  /jobs/{job_id}/estimates:
 *  get:
 *    tags:
 *    - estimates
 *    summary: gets a list of all estimates for a job, the user must own this job
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
 *        description: array of estimates
 *        schema:
 *          $ref: '#/definitions/Estimate'
 */
router.get('/:job_id/estimates', authHelpers.ensureAuthenticated, async (req, res) => {
  let job_id = req.params.job_id;

  try {
    let estimates = await knex('estimates')
      .select('*')
      .where({ job_id });

    if (estimates.length) {
      res.status(200).json(estimates);
    } else {
      res.status(404).json(`no estimates found for job ${job_id}`);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

/**
 * @swagger
 *  /jobs/{job_id}/estimates/{estimate_id}/total_cost:
 *  get:
 *    tags:
 *    - estimates
 *    summary: gets the total cost of all estimates for an estimate, the user must own this job
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
 *        description: array of estimates
 *        schema:
 *          $ref: '#/definitions/Estimate'
 */
router.get(
  '/:job_id/estimates/:estimate_id/total_cost',
  authHelpers.ensureAuthenticated,
  async (req, res) => {
    let job_id = req.params.job_id;
    let estimate_id = req.params.estimate_id;

    try {
      let services = await knex('services_materials')
        .join('services', 'services.id', '=', 'services_materials.service_id')
        .join('trades', 'trades.id', '=', 'services.trade_id')
        .select('quantity', 'cost_per_unit')
        .where({ estimate_id });
      let labor = await knex('services_labor')
        .join('services', 'services.id', '=', 'services_labor.service_id')
        .join('trades', 'trades.id', '=', 'services.trade_id')
        .select('hours', 'cost_per_hour')
        .where({ estimate_id });

      let total = 0;
      services.forEach(s => {
        total += s.quantity * s.cost_per_unit;
      });
      labor.forEach(l => {
        total += l.hours * l.cost_per_hour;
      });

      res.status(200).json(total);
    } catch (err) {
      console.log(err);
      res.status(500).json(err.message);
    }
  }
);

/**
 * @swagger
 *  /jobs/{job_id}/estimates/{estimate_id}:
 *  get:
 *    tags:
 *    - estimates
 *    summary: gets a specific estimate, the user must own this job
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
 *        description: successful operation
 *        schema:
 *          $ref: '#/definitions/Estimate'
 *      404:
 *        description: estimate could not be found
 */
router.get(
  '/:job_id/estimates/:estimate_id(\\d+)',
  authHelpers.ensureAuthenticated,
  async (req, res) => {
    let job_id = req.params.job_id;
    let estimate_id = req.params.estimate_id;

    try {
      let estimate = await knex('estimates')
        .select('*')
        .where({ job_id, id: estimate_id })
        .first();
      if (estimate) {
        return res.status(200).json(estimate);
      } else {
        return res.status(404).json(`no estimate found with id ${estimate_id}`);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json(err.message);
    }
  }
);

/**
 * @swagger
 *  /jobs/{job_id}/estimates:
 *  post:
 *    tags:
 *    - estimates
 *    summary: add a estimate to a job, the user must own this job
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
 *          $ref: '#/definitions/Estimate'
 */
router.post('/:job_id/estimates', authHelpers.ensureAuthenticated, async (req, res) => {
  let job_id = req.params.job_id;

  let job = await knex('jobs')
    .where({ id: job_id })
    .first();

  if (job) {
    try {
      let estimate = await knex('estimates').insert({ job_id });
      res.status(200).json(estimate);
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
 *  /jobs/{job_id}/estimates/{estimate_id}:
 *  delete:
 *    tags:
 *    - estimates
 *    summary: delete an estimate, the user must own this job
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
 *        description: successful operation
 *      400:
 *        description: estimate does not exist
 */
router.delete(
  '/:job_id/estimates/:estimate_id',
  authHelpers.ensureAuthenticated,
  async (req, res) => {
    let job_id = req.params.job_id;
    let estimate_id = req.params.estimate_id;

    let deletedEstimate = await knex('estimates')
      .where({ job_id, id: estimate_id })
      .delete();

    if (deletedEstimate) {
      res.status(200).json(`successfully deleted estimate ${estimate_id}`);
    } else {
      res.status(400).json({ error: `estimate ${estimate_id} does not exist` });
    }
  }
);

export default router;
