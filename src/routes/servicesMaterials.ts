import * as express from 'express';
import knex from '../db/connection';
import authHelpers from '../auth/_helpers';
import routeHelpers from './_helpers';

const router = express.Router();
/**
 * @swagger
 * definitions:
 *   Material:
 *     properties:
 *       id:
 *         type: integer
 *       name:
 *         type: string
 *       quantity:
 *         type: integer
 *       unit:
 *         type: string
 *       cost_per_unit:
 *         type: float
 *       supplier_cost:
 *         type: float
 *       profit:
 *         type: float
 */

/**
 * @swagger
 *  /jobs/{job_id}/services/{service_id}/materials:
 *  get:
 *    tags:
 *    - materials
 *    summary: gets a list of all materials for a service, the user must own this job
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
 *        description: array of materials
 *        schema:
 *          $ref: '#/definitions/Service'
 */
router.get(
  '/:job_id/services/:service_id/materials',
  authHelpers.ensureAuthenticated,
  routeHelpers.checkUserOwnsJob,
  async (req, res) => {
    let job_id = req.params.job_id;
    let service_id = req.params.service_id;

    try {
      let materials = await knex('services_materials')
        .where({ service_id })
        .select('*');

      res.status(200).json(materials);
    } catch (err) {
      console.log(err);
      res.status(500).json(err.message);
    }
  }
);

/**
 * @swagger
 *  /jobs/{job_id}/services/{service_id}/materials:
 *  post:
 *    tags:
 *    - materials
 *    summary: add a material to a service, the user must own this job
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
 *      - name: material
 *        in: body
 *        required: true
 *        schema:
 *         type: object
 *         properties:
 *           name:
 *             example: material name
 *           quantity:
 *             example: 100
 *           unit:
 *             example: units
 *           cost_per_unit:
 *             example: 10
 *           supplier_cost:
 *             example: 5
 *           profit:
 *             example: 50
 *    responses:
 *      200:
 *        description: successful operation
 *        schema:
 *          $ref: '#/definitions/Material'
 */
router.post(
  '/:job_id/services/:service_id/materials',
  authHelpers.ensureAuthenticated,
  routeHelpers.checkUserOwnsJob,
  async (req, res) => {
    let job_id = req.params.job_id;
    let service_id = req.params.service_id;

    let values: any = routeHelpers.filterBody(req.body, ['name', 'trade_id', 'order_id']);

    try {
      let material = await knex('services_materials').insert({ ...values, service_id }, '*');

      res.status(200).json(material);
    } catch (err) {
      console.log(err);
      res.status(500).json(err.message);
    }
  }
);

/**
 * @swagger
 *  /jobs/{job_id}/services/{service_id}/materials/{material_id}:
 *   put:
 *     tags:
 *     - materials
 *     security:
 *       - Bearer: []
 *     summary: Updates a material, the user must own this job
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
 *       - name: service_id
 *         description: The id of the service
 *         in: path
 *         required: true
 *         type: integer
 *         example: 1
 *       - name: material_id
 *         description: The id of the material
 *         in: path
 *         required: true
 *         type: integer
 *         example: 1
 *       - name: material
 *         in: body
 *         required: true
 *         schema:
 *          type: object
 *          properties:
 *            name:
 *              example: material name
 *            quantity:
 *              example: 100
 *            unit:
 *              example: units
 *            cost_per_unit:
 *              example: 10
 *            supplier_cost:
 *              example: 5
 *            profit:
 *              example: 50
 *     responses:
 *       200:
 *         description: A material
 *         schema:
 *           $ref: '#/definitions/Material'
 *       400:
 *         description: material doesn't exist
 *       500:
 *         description: an error occurred
 */
router.put(
  '/:job_id/services/:service_id/materials/:material_id',
  authHelpers.ensureAuthenticated,
  routeHelpers.checkUserOwnsJob,
  async (req: any, res) => {
    let job_id = req.params.job_id;
    let material_id = req.params.material_id;

    let values = routeHelpers.filterBody(req.body, [
      'name',
      'quantity',
      'unit',
      'cost_per_unit',
      'supplier_cost',
      'profit'
    ]);

    try {
      let material = await knex('services_materials')
        .where({ id: material_id })
        .first();

      if (material) {
        let updatedMaterial = await knex('services_materials')
          .where({ id: material_id })
          .update(values, '*');
        res.status(200).json(updatedMaterial[0]);
      } else {
        res.status(400).json({
          error: `material ${material_id} does not exist or is not owned by this user.`
        });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

/**
 * @swagger
 *  /jobs/{job_id}/materials/{material_id}:
 *  delete:
 *    tags:
 *    - services
 *    summary: delete a material, the user must own this job
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
 *      - name: material_id
 *        in: path
 *        description: The id of the material
 *        required: true
 *        type: integer
 *        example: 1
 *    responses:
 *      200:
 *        description: successful operation
 *      400:
 *        description: material does not exist
 */
router.delete(
  '/:job_id/materials/:material_id',
  authHelpers.ensureAuthenticated,
  routeHelpers.checkUserOwnsJob,
  async (req, res) => {
    let job_id = req.params.job_id;
    let material_id = req.params.material_id;

    let deletedMaterial = await knex('services_materials')
      .where({ id: material_id })
      .delete();

    if (deletedMaterial) {
      res.status(200).json(`successfully deleted material ${material_id}`);
    } else {
      res.status(400).json({ error: `material ${material_id} does not exist` });
    }
  }
);

export default router;
