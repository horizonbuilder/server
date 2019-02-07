import * as express from 'express';
import knex from '../db/connection';
import authHelpers from '../auth/_helpers';
import routeHelpers from './_helpers';
import * as fs from 'fs';

const router = express.Router();
/**
 * @swagger
 * definitions:
 *   Report:
 *     properties:
 *       id:
 *         type: integer
 *       report:
 *         type: object
 *       workfile_id:
 *         type: integer
 */

/**
 * @swagger
 * /workfiles/{workfile_id}/reports:
 *   get:
 *     tags:
 *       - Reports
 *     security:
 *       - Bearer: []
 *     description: Returns all Reports in a workfile
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: workfile_id
 *         in: path
 *         description: The id of the workfile
 *         required: true
 *         type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Array of Reports
 *         schema:
 *           $ref: '#/definitions/Report'
 */
router.get('/:workfile_id/reports', authHelpers.ensureAuthenticated, (req: any, res, next) => {
  let workfile_id = req.params.workfile_id;
  knex('reports')
    .select('*')
    .where('workfile_id', workfile_id)
    .then(reports => {
      if (reports.length) {
        res.status(200).json(reports);
      } else {
        res.status(404).json(`no reports found for workfile ${workfile_id}`);
      }
    });
});

/**
 * @swagger
 *  /workfiles/{workfile_id}/reports:
 *  post:
 *    tags:
 *    - Reports
 *    security:
 *      - Bearer: []
 *    summary: add a report
 *    produces:
 *    - application/json
 *    consumes:
 *    - application/json
 *    parameters:
 *      - name: workfile_id
 *        in: path
 *        description: The id of the workfile
 *        required: true
 *        type: integer
 *        example: 1
 *      - name: report
 *        in: body
 *        description: The report data
 *        schema:
 *          type: object
 *          properties:
 *            report:
 *              example: "oh hi there!"
 *    responses:
 *      200:
 *        description: successful operation
 *        schema:
 *          $ref: '#/definitions/Report'
 */
router.post('/:workfile_id/reports', authHelpers.ensureAuthenticated, (req, res) => {
  let workfile_id = req.params.workfile_id;
  let reportData = req.body.report;
  knex('reports')
    .where({ workfile_id: workfile_id })
    .then(report => {
      if (report.length) {
        knex('reports')
          .where({ workfile_id: workfile_id })
          .update({ report: reportData }, '*')
          .then(report => {
            res.status(200).json({ success: true });
          });
      } else {
        knex('reports')
          .insert({ workfile_id: workfile_id, report: reportData }, '*')
          .then(report => {
            res.status(200).json({ success: true });
          });
      }
    });
});

export default router;
