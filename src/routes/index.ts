import * as express from 'express';
import CacheHelper from './_cacheHelper';

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - index
 *     description: index
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success response
 */
router.get('/', function(req, res, next) {
  res.json({ status: 'success' });
});

router.use(function(req, res, next) {
  // if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
  CacheHelper.invalidateCache();
  // }
  next();
});

export default router;
