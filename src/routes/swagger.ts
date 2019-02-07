import swaggerJSDoc = require('swagger-jsdoc');
import * as express from 'express';

const router = express.Router();

let swaggerDefinition = {
  info: {
    title: 'TerraceAg server API',
    version: '1.0.0',
    description: 'RESTful API for TerraceAg project'
  },
  host: process.env.HOST_NAME || 'localhost:3000',
  basePath: '/',
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  }
};

// options for the swagger docs
let options = {
  swaggerDefinition: swaggerDefinition,
  apis: ['./src/routes/**/*.ts']
};

// initialize swagger-jsdoc
let swaggerSpec = swaggerJSDoc(options);
router.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
router.use('/', express.static('api-docs'));

export default router;
