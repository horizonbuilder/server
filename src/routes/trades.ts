import * as express from 'express';
import knex from '../db/connection';
import authHelpers from '../auth/_helpers';
import routeHelpers from './_helpers';

const router = express.Router();
/**
 * @swagger
 * definitions:
 *   Trade:
 *     properties:
 *       id:
 *         type: integer
 *       name:
 *         type: string
 */

/**
 * @swagger
 *  /jobs/{job_id}/estimates/{estimate_id}/trades:
 *  get:
 *    tags:
 *    - trades
 *    summary: gets a list of all trades for am estimate, the user must own this job
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
 *        description: array of trades
 *        schema:
 *          $ref: '#/definitions/Trade'
 */
router.get(
  '/:job_id/estimates/:estimate_id/trades',
  authHelpers.ensureAuthenticated,
  async (req, res) => {
    let job_id = req.params.job_id;
    let estimate_id = req.params.estimate_id;

    try {
      let trades = await knex('trades')
        .select('*')
        .where({ estimate_id });

      if (trades.length) {
        res.status(200).json(trades);
      } else {
        res.status(404).json(`no trades found for estimate ${estimate_id}`);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json(err.message);
    }
  }
);

/**
 * @swagger
 *  /jobs/{job_id}/estimates/{estimate_id}/trades:
 *  post:
 *    tags:
 *    - trades
 *    summary: add a trade to an estimate, the user must own this job
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
 *      - name: estimate_id
 *        in: path
 *        description: The id of the estimate
 *        required: true
 *        type: integer
 *        example: 1
 *      - name: trade
 *        in: body
 *        required: true
 *        schema:
 *         type: object
 *         properties:
 *           name:
 *             example: service name
 *    responses:
 *      200:
 *        description: successful operation
 *        schema:
 *          $ref: '#/definitions/Trade'
 */
router.post(
  '/:job_id/estimates/:estimate_id/trades',
  authHelpers.ensureAuthenticated,
  async (req, res) => {
    let job_id = req.params.job_id;
    let estimate_id = req.params.estimate_id;

    let estimate = await knex('estimates')
      .where({ id: estimate_id })
      .first();

    if (estimate) {
      try {
        let trade = await knex('trades').insert({ name: req.body.name, estimate_id }, '*');
        res.status(200).json(trade[0]);
      } catch (err) {
        console.log(err);
        return res.status(500).json(err.message);
      }
    } else {
      res.status(400).json({ error: `estimate ${estimate_id} does not exist` });
    }
  }
);

/**
 * @swagger
 *  /jobs/{job_id}/estimates/{estimate_id}/trades/{trade_id}:
 *  delete:
 *    tags:
 *    - trades
 *    summary: delete an trade, the user must own this job
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
 *      - name: trade_id
 *        in: path
 *        description: The id of the trade
 *        required: true
 *        type: integer
 *        example: 1
 *    responses:
 *      200:
 *        description: successful operation
 *      400:
 *        description: trade does not exist
 */
router.delete(
  '/:job_id/estimates/:estimate_id/trades/:trade_id',
  authHelpers.ensureAuthenticated,
  async (req, res) => {
    let job_id = req.params.job_id;
    let trade_id = req.params.trade_id;

    let deletedTrade = await knex('trades')
      .where({ id: trade_id })
      .delete();

    if (deletedTrade) {
      res.status(200).json(`successfully deleted trade ${trade_id}`);
    } else {
      res.status(400).json({ error: `trade ${trade_id} does not exist` });
    }
  }
);

export default router;
