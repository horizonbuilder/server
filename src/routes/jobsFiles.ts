import * as express from 'express';
import knex from '../db/connection';
import authHelpers from '../auth/_helpers';
import routeHelpers from './_helpers';

const router = express.Router();
/**
 * @swagger
 * definitions:
 *   File:
 *     properties:
 *       file_url:
 *         type: string
 *       group:
 *         type: string
 *       description:
 *         type: string
 *       payload:
 *         type: string
 */

/**
 * @swagger
 *  /jobs/{job_id}/files:
 *  get:
 *    tags:
 *    - files
 *    summary: returns all files associated with this job
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
 *        description: successful operation
 *        schema:
 *          $ref: '#/definitions/File'
 */
router.get('/:job_id/files', authHelpers.ensureAuthenticated, async (req, res) => {
  let job_id = req.params.job_id;

  try {
    let files = await knex('jobs_files').where('job_id', job_id);
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @swagger
 *  /jobs/{job_id}/files:
 *  post:
 *    tags:
 *    - files
 *    summary: add a file to a job
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
 *      - in: body
 *        name: job
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            file_url:
 *              example: http://example.com/image.png
 *            description:
 *              example: file description
 *            group:
 *              example: file group name
 *    responses:
 *      200:
 *        description: successful operation
 *        schema:
 *          $ref: '#/definitions/File'
 */
router.post('/:job_id/files', authHelpers.ensureAuthenticated, async (req, res) => {
  let job_id = req.params.job_id;
  let values = routeHelpers.filterBody(req.body, ['file_url', 'group', 'description', 'payload']);
  try {
    let file = await knex('properties_files').insert({ ...values, job_id }, '*');
    res.status(200).json(file);
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @swagger
 *  /jobs/{job_id}/files/{file_id}:
 *  put:
 *    tags:
 *    - files
 *    summary: update a file, the user must belong to the organization that owns this job
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
 *      - name: file_id
 *        in: path
 *        description: The id of the file
 *        required: true
 *        type: integer
 *        example: 1
 *      - in: body
 *        name: file
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            file_url:
 *              example: http://example.com/image.png
 *            description:
 *              example: file description
 *            group:
 *              example: file group name
 *    responses:
 *      200:
 *        description: successful operation
 *        schema:
 *          $ref: '#/definitions/File'
 */
router.put('/:job_id/files/:file_id', authHelpers.ensureAuthenticated, async (req, res) => {
  let file_id = req.params.file_id;
  let job_id = req.params.job_id;
  let values = routeHelpers.filterBody(req.body, ['file_url', 'group', 'description']);
  try {
    let file = await knex('properties_files')
      .where({ id: file_id, job_id })
      .first();

    if (!file) return;

    let updatedFiles = await knex('properties_files')
      .where('id', file_id)
      .update(values, '*');
    if (updatedFiles.length) {
      res.status(200).json(updatedFiles[0]);
    } else {
      res.status(404).json(`file not found with id: ${file_id}`);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

/**
 * @swagger
 *  /jobs/{job_id}/files/{file_id}:
 *  delete:
 *    tags:
 *    - files
 *    summary: delete a file
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
 *      - name: file_id
 *        in: path
 *        description: The id of the file
 *        required: true
 *        type: integer
 *        example: 1
 *    responses:
 *      200:
 *        description: successful operation
 *      400:
 *        description: file does not exist
 */
router.delete('/:job_id/files/:file_id', authHelpers.ensureAuthenticated, async (req, res) => {
  let file_id = req.params.file_id;
  let job_id = req.params.job_id;

  try {
    let file = await knex('properties_files')
      .where({ id: file_id, job_id })
      .delete();
    if (file) {
      res.status(200).json(file);
    } else {
      res.status(404).json(`file not found with id: ${file_id}`);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
