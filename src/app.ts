import * as express from 'express';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import * as session from 'express-session';
import * as aws from 'aws-sdk';
import * as compression from 'compression';

import swagger from './routes/swagger';
import index from './routes/index';
import users from './routes/users';
import auth from './routes/auth';
import reports from './routes/reports';
import upload from './routes/upload';
import jobsFiles from './routes/jobsFiles';
import clients from './routes/clients';
import pdf from './routes/pdf';
import jobs from './routes/jobs';
import orders from './routes/orders';
import estimates from './routes/estimates';
import services from './routes/services';
import materials from './routes/servicesMaterials';
import trades from './routes/trades';

class App {
  // ref to Express instance
  public express: express.Application;

  //Run configuration methods on the Express instance.
  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json({ limit: '10mb' }));
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(cookieParser());
    this.express.use(
      session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: true
      })
    );
    this.express.use(passport.initialize());
    this.express.use(passport.session());
    this.express.use(function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials, Accept-Encoding'
      );
      res.header('Access-Control-Allow-Credentials', 'true');
      next();
    });
    this.express.use(compression());
  }

  // Configure API endpoints.
  private routes(): void {
    this.express.use('/docs', swagger);
    this.express.use('/', index);
    this.express.use('/', auth);
    this.express.use('/users', users);
    this.express.use('/clients', clients);

    this.express.use('/jobs', jobsFiles);
    this.express.use('/jobs', jobs);
    this.express.use('/jobs', orders);
    this.express.use('/jobs', estimates);
    this.express.use('/jobs', services);
    this.express.use('/jobs', materials);
    this.express.use('/jobs', trades);

    this.express.use('/upload', upload);
    this.express.use('/', pdf);
  }
}

export default new App().express;
