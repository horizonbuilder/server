import * as express from 'express';
import knex from '../db/connection';
import authHelpers from '../auth/_helpers';
import routeHelpers from './_helpers';

const router = express.Router();
/**
 * @swagger
 * definitions:
 *   Job:
 *     properties:
 *       id:
 *         type: integer
 *       name:
 *         type: string
 *       client_name:
 *         type: string
 *       status:
 *         type: string
 *       created_at:
 *         type: timestamp
 */

/**
 * @swagger
 * /jobs:
 *   get:
 *     tags:
 *       - jobs
 *     security:
 *       - Bearer: []
 *     description: Returns all jobs that belong to the user
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Array of all jobs
 *         schema:
 *           $ref: '#/definitions/Job'
 */
router.get('/', authHelpers.ensureAuthenticated, (req: any, res) => {
  getjobs(res, req.user.id);
});

/**
 * @swagger
 * /jobs/{job_id}:
 *   get:
 *     tags:
 *       - jobs
 *     security:
 *       - Bearer: []
 *     description: Returns a single job, the user must own this job
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: job_id
 *         in: path
 *         description: "The id of the job"
 *         required: true
 *         type: integer
 *         schema:
 *            example: 1
 *     responses:
 *       200:
 *         description: A single job
 *         schema:
 *           $ref: '#/definitions/Job'
 *       404:
 *         description: no job found with id ...
 */
router.get('/:job_id(\\d+)', authHelpers.ensureAuthenticated, (req: any, res) => {
  let job_id = req.params.job_id;
  let user_id = req.user.id;
  getjobs(res, user_id, job_id);
});

/**
 * @swagger
 * /jobs/{status}:
 *   get:
 *     tags:
 *       - jobs
 *     security:
 *       - Bearer: []
 *     description: Returns all jobs with the given status that belong to the user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: status
 *         in: path
 *         description: job status
 *         required: true
 *         type: string
 *         example: in-progress
 *     responses:
 *       200:
 *         description: all jobs with the given status
 *         schema:
 *           $ref: '#/definitions/Job'
 *       404:
 *         description: no job found with status
 */
router.get('/:status(\\D+)', authHelpers.ensureAuthenticated, (req: any, res) => {
  let status = req.params.status;
  let user_id = req.user.id;

  knex('jobs')
    .join('clients', 'jobs.client_id', '=', 'clients.id')
    .select('jobs.*', 'clients.name as client_name')
    .where({ user_id, status })
    .then(jobs => {
      if (jobs.length) res.status(200).json(jobs);
      else res.status(404).json('no job found with status: ' + status);
    });
});

let getjobs = async (res, user_id: number, job_id?: number) => {
  let where = { user_id };
  if (job_id) {
    where['jobs.id'] = job_id;
  }

  try {
    let jobs = await knex('jobs')
      .leftJoin('clients', 'jobs.client_id', '=', 'clients.id')
      .select('jobs.id', 'jobs.name', 'status', 'created_at', 'clients.name as client_name')
      .where(where);

    if (jobs.length) res.status(200).json(job_id ? jobs[0] : jobs);
    else {
      let message = `no jobs found for user ${user_id}`;
      if (job_id) message += ` with id: ${job_id}`;
      res.status(404).json(message);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
};

/**
 * @swagger
 * /jobs:
 *   post:
 *    tags:
 *       - jobs
 *    security:
 *      - Bearer: []
 *    description: Creates a job
 *    produces:
 *       - application/json
 *    consumes:
 *    - application/json
 *    parameters:
 *      - name: job
 *        in: body
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              example: job
 *            client_name:
 *              example: client name
 *    responses:
 *      200:
 *        description: A single job
 *        schema:
 *          $ref: '#/definitions/Job'
 */
router.post('/', authHelpers.ensureAuthenticated, async (req: any, res) => {
  let user_id = req.user.id;
  let values: any = {};
  try {
    values = routeHelpers.parseBodyRequiredValues(req.body, ['name']);
  } catch (err) {
    res.status(400).json({ error: err, message: err.message });
  }
  values['user_id'] = user_id;

  try {
    let job_ids = await knex('jobs').insert(values, 'id');
    getjobs(res, user_id, job_ids[0]);
  } catch (err) {
    res.status(500).json({ error: err, message: err.message });
  }
});

/**
 * @swagger
 * /jobs/{job_id}:
 *   put:
 *     tags:
 *       - jobs
 *     security:
 *       - Bearer: []
 *     description: Updates a job, the user must own this job
 *     produces:
 *       - application/json
 *     consumes:
 *     - application/json
 *     parameters:
 *       - name: job_id
 *         in: path
 *         required: true
 *         type: integer
 *         example: 2
 *       - name: job
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               example: job
 *             client_name:
 *               example: client name
 *             status:
 *               example: revised
 *     responses:
 *       200:
 *         description: A single job
 *         schema:
 *           $ref: '#/definitions/Job'
 *       400:
 *         description: job doesn't exist
 *       500:
 *         description: an error occurred
 */
router.put('/:job_id', authHelpers.ensureAuthenticated, (req: any, res) => {
  let job_id = req.params.job_id;
  let user_id = req.user.id;
  let values = routeHelpers.filterBody(req.body, ['name', 'client_name', 'status']);

  knex('jobs')
    .where({ user_id, id: job_id })
    .first()
    .then(job => {
      if (job) {
        return knex('jobs')
          .where({ id: job_id })
          .update(values, '*')
          .then(jobs => {
            getjobs(res, user_id, jobs[0].id);
          });
      } else
        res.status(400).json({
          error: `job id: ${job_id} does not exist or is not owned by this user`
        });
    })
    .catch(err => res.status(500).json({ error: err, message: err.message }));
});

/**
 * @swagger
 * /jobs/{job_id}:
 *   delete:
 *     tags:
 *       - jobs
 *     security:
 *       - Bearer: []
 *     description: Deletes a job, the user must own this job
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: job_id
 *         type: integer
 *         required: true
 *         example: 2
 *     responses:
 *       200:
 *         description: successful operation
 *         schema:
 *           $ref: '#/definitions/Job'
 *       400:
 *         description: job does not exist
 */
router.delete('/:job_id', authHelpers.ensureAuthenticated, (req: any, res) => {
  let job_id = req.params.job_id;
  let user_id = req.user.id;

  knex('jobs')
    .where({ user_id, id: job_id })
    .delete()
    .then(resp => {
      if (resp) res.status(200).json(`successfully deleted job ${job_id}`);
      else
        res.status(400).json({
          error: `job id: ${job_id} does not exist or is not owned by this user`
        });
    });
});

export default router;
