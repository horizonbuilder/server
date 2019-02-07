import * as express from 'express';
import * as aws from 'aws-sdk';
import * as uuid from 'uuid/v4';
import knex from '../db/connection';
import authHelpers from '../auth/_helpers';
import routeHelpers from './_helpers';

const router = express.Router();

/**
 * @swagger
 * definitions:
 *   Upload:
 *     properties:
 *       signedRequest:
 *         type: string
 *       url:
 *         type: string
 */

/**
 * @swagger
 * /upload:
 *  get:
 *    tags:
 *      - upload
 *    summary: processes the upload and returns the signed request from AWS and file url
 *    security:
 *      - Bearer: []
 *    produces:
 *    - application/json
 *    parameters:
 *      - name: file-name
 *        in: query
 *        description: The name of the file
 *        required: true
 *        type: string
 *        example: org-logo.jpg
 *      - name: file-type
 *        in: query
 *        description: The file type of the file
 *        required: true
 *        type: string
 *        example: .jpg
 *    responses:
 *      200:
 *        description: Successful operation, signature, url returned
 *        schema:
 *          $ref: '#/definitions/Upload'
 */
aws.config.region = process.env.AWS_S3_REGION;

router.get('/', authHelpers.ensureAuthenticated, async (req, res) => {
  try {
    let s3Data = await uploadFile(req.query['file-name'], req.query['file-type']);
    res.status(200).json(s3Data);
  } catch (err) {
    res.status(500).json(err);
  }
});

export async function uploadFile(fileName, fileType, folder = null) {
  let fileUUID = uuid();
  let S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;
  let REGION = process.env.AWS_S3_REGION;
  let s3 = new aws.S3();
  let prefix = folder ? folder + '/' : '';
  let s3Params = {
    Bucket: S3_BUCKET,
    Key: prefix + fileUUID + '-' + fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if (err) {
        reject(err);
      }
      let s3Data = {
        signedRequest: data,
        url: `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${fileUUID}-${fileName}`
      };
      resolve(s3Data);
    });
  });
}

export default router;
