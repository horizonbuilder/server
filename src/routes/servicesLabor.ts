import * as express from 'express';
import knex from '../db/connection';
import authHelpers from '../auth/_helpers';
import routeHelpers from './_helpers';

const router = express.Router();
/**
 * @swagger
 * definitions:
 *   Labor:
 *     properties:
 *       id:
 *         type: integer
 *       description:
 *         type: string
 *       hours:
 *         type: integer
 *       cost_per_hour:
 *         type: float
 */

/**
 * @swagger
 *  /jobs/{job_id}/services/{service_id}/labor:
 *  get:
 *    tags:
 *    - labor
 *    summary: gets a list of all labor for a service, the user must own this job
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
 *        description: array of labor
 *        schema:
 *          $ref: '#/definitions/Labor'
 */
router.get(
  '/:job_id/services/:service_id/labor',
  authHelpers.ensureAuthenticated,
  routeHelpers.checkUserOwnsJob,
  async (req, res) => {
    let job_id = req.params.job_id;
    let service_id = req.params.service_id;

    try {
      let labor = await knex('services_labor')
        .where({ service_id })
        .select('*');

      res.status(200).json(labor);
    } catch (err) {
      console.log(err);
      res.status(500).json(err.message);
    }
  }
);

/**
 * @swagger
 *  /jobs/{job_id}/services/{service_id}/labor:
 *  post:
 *    tags:
 *    - labor
 *    summary: add a labor to a service, the user must own this job
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
 *      - name: labor
 *        in: body
 *        required: true
 *        schema:
 *         type: object
 *         properties:
 *           description:
 *             example: labor name
 *           hours:
 *             example: 10
 *           cost_per_hour:
 *             example: 100
 *    responses:
 *      200:
 *        description: successful operation
 *        schema:
 *          $ref: '#/definitions/Labor'
 */
router.post(
  '/:job_id/services/:service_id/labor',
  authHelpers.ensureAuthenticated,
  routeHelpers.checkUserOwnsJob,
  async (req, res) => {
    let job_id = req.params.job_id;
    let service_id = req.params.service_id;

    let values: any = routeHelpers.filterBody(req.body, ['description', 'hours', 'cost_per_hour']);

    try {
      let labor = await knex('services_labor').insert({ ...values, service_id }, '*');

      res.status(200).json(labor[0]);
    } catch (err) {
      console.log(err);
      res.status(500).json(err.message);
    }
  }
);

/**
 * @swagger
 *  /jobs/{job_id}/labor/{labor_id}:
 *   put:
 *     tags:
 *     - labor
 *     security:
 *       - Bearer: []
 *     summary: Updates a labor, the user must own this job
 *     produces:
 *     - application/json
 *     consumes:
 *     - application/json
 *     parameters:
 *       - name: job_id
 *         description: The id of the job
 *         in: path
 *         required: true
 *         type: integer
 *         example: 1
 *       - name: labor_id
 *         description: The id of the labor
 *         in: path
 *         required: true
 *         type: integer
 *         example: 1
 *       - name: labor
 *         in: body
 *         required: true
 *         schema:
 *          type: object
 *          properties:
 *            description:
 *              example: labor name
 *            hours:
 *              example: 100
 *            cost_per_hour:
 *              example: 10
 *     responses:
 *       200:
 *         description: A labor
 *         schema:
 *           $ref: '#/definitions/Labor'
 *       400:
 *         description: labor doesn't exist
 *       500:
 *         description: an error occurred
 */
router.put(
  '/:job_id/labor/:labor_id',
  authHelpers.ensureAuthenticated,
  routeHelpers.checkUserOwnsJob,
  async (req: any, res) => {
    let job_id = req.params.job_id;
    let labor_id = req.params.labor_id;

    let values = routeHelpers.filterBody(req.body, ['description', 'hours', 'cost_per_hour']);

    try {
      let labor = await knex('services_labor')
        .where({ id: labor_id })
        .first();

      if (labor) {
        let updatedLabor = await knex('services_labor')
          .where({ id: labor_id })
          .update(values, '*');
        res.status(200).json(updatedLabor[0]);
      } else {
        res.status(400).json({
          error: `labor ${labor_id} does not exist or is not owned by this user.`
        });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

/**
 * @swagger
 *  /jobs/{job_id}/labor/{labor_id}:
 *  delete:
 *    tags:
 *    - labor
 *    summary: delete a labor, the user must own this job
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
 *      - name: labor_id
 *        in: path
 *        description: The id of the labor
 *        required: true
 *        type: integer
 *        example: 1
 *    responses:
 *      200:
 *        description: successful operation
 *      400:
 *        description: labor does not exist
 */
router.delete(
  '/:job_id/labor/:labor_id',
  authHelpers.ensureAuthenticated,
  routeHelpers.checkUserOwnsJob,
  async (req, res) => {
    let job_id = req.params.job_id;
    let labor_id = req.params.labor_id;

    let deletedLabor = await knex('services_labor')
      .where({ id: labor_id })
      .delete();

    if (deletedLabor) {
      res.status(200).json(`successfully deleted labor ${labor_id}`);
    } else {
      res.status(400).json({ error: `labor ${labor_id} does not exist` });
    }
  }
);

export default router;
