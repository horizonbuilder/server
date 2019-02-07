# HB Server API

Back end API for the HB application
It handles user authentication and exposes endpoints which allow for the modification of data.

---

## Requirements

1.  [Node](https://nodejs.org/) - The `HB-server` is built in [TypeScript](https://www.typescriptlang.org) (a superset of JavaScript) and runs on [Node](https://nodejs.org/en/). As such, you will need to have it installed to run the API.
2.  [Yarn](https://yarnpkg.com/en/docs/install) - This project uses Yarn to interact with [NPM](https://www.npmjs.com); to fetch, install, and manage project dependancies. More information about installing and using Yarn can be found at the site linked above.
3.  [PostgreSQL](https://www.postgresql.org) - This project uses PostsgreSQL to store data and associated information. You will need to have an instance of PostgreSQL setup and properly configured and seeded to use this API. Additional instructions can be in the [Configuration](#configuration-options) section below.
4.  [Knex](http://knexjs.org) - This project uses Knex to handle migrations, seed, and build queries for the PostgreSQL database. Some commands require either the command line tool to be installed or to reference the binary installed within the project root.

## Installation

1.  `git clone git@github.com:horizonbuilder/server.git`
2.  Run `yarn` to install the project dependencies
3.  Create a config file based on the `.example.env` file (see the [Configuration](#configuration-options) section below).

* e.g. `$ cp .example.env .env`

4.  Set up PostgreSQL and add the appropriate connection URL and authentication info to the `.env` file.

5.  Run the various database migrations. The exact command will vary depending on whether you have installed Knex globally or locally.

* Globally - `knex migrate:latest --knexfile src/knexfile.js --env local`
* Locally - `node_modules/knex/bin/cli.js migrate:latest --knexfile src/knexfile.js --env local`

6.  There is test data that can be used to seed the database.

* Globally - `knex seed:run --knexfile src/knexfile.js --env local`
* Locally - `node_modules/knex/bin/cli.js seed:run --knexfile src/knexfile.js --env local`

7.  Launch the server / API using `yarn start`

## Tests

There is currently a single testing framework in place for the server side code.

### Jest

[Jest](https://facebook.github.io/jest/) is used for server side testing.

Since the tests rely on hitting endpoints and making queries, there are `beforeAll` and `afterAll` blocks that set up and tear down a test database.

As such, you will need to set up the database before running the suite. Currently, the test DB is named, `hbdb_test`.

The test suite is run using `yarn test`.

## Builds

The build process for this API is handled by the Typescript config file, `tsconfig.json`.

The build command is incorporated in the `package.json` file and run when launching the project with `yarn start`.

In addition, this project uses [nodemon](https://nodemon.io) to monitor project files for changes during development.

## Configuration Options

A sample config file is supplied in `.example.env`

Currently, there are only a handful of global variables for this project. More will be added in the future.

Examples listed below with an `*` are not yet implemented.

### Authentication

| Option       | Value                                                    |
| ------------ | -------------------------------------------------------- |
| SECRET_KEY   | Express session secret key - Required in order to launch |
| TOKEN_SECRET | JSON Web Token secret - Required in order to launch      |

### Server Connection

| Option | Value                                           |
| ------ | ----------------------------------------------- |
| PORT   | The default port the http server will listen on |

### Database

These are the values required to connect to the PostgreSQL instance

| Option       | Value                                    |
| ------------ | ---------------------------------------- |
| DATABASE_URL | Host URL for the DB                      |
| DB_PORT\*    | Port number for the DB, default is 27017 |
| DB_NAME\*    | Name of the database                     |
| DB_USER\*    | Username for the database                |
| DB_PASS\*    | Password for the database                |

### AWS File Upload

These variables are for local development only. For production, they will likely be set as [Heroku app](https://devcenter.heroku.com/articles/config-vars) configuration variables.

| Option                | Value                                 |
| --------------------- | ------------------------------------- |
| AWS_ACCESS_KEY_ID     | AWS key ID for direct uploads to S3   |
| AWS_SECRET_ACCESS_KEY | AWS secret key for direct file upload |
| AWS_S3_BUCKET_NAME    | AWS S3 Bucket Name                    |

### Logging / Swagger Documentation

| Option             | Value                   |
| ------------------ | ----------------------- |
| HOST_NAME          | Swagger host name       |
| ACCESS_LOG\*       | Path to server log file |
| ERROR_LOG\*        | Path to error log file  |
| APP_LOG_LEVEL\*    | App error log level     |
| SERVER_LOG_LEVEL\* | Server error log level  |

#### Error Severity

Server level logging. This is provided by the [Morgan library](https://github.com/expressjs/morgan).

```
* combined:		Standard Apache COMBINED log output.
* common: 		Standard Apache COMMON log output.
* dev:			Concise output colored by response status for development use.
* short:		Shorter than default, also including response time.
* tiny:			The minimal output
```

## Usage

This project uses [Swagger](https://swagger.io) to document and provide a means of testing API endpoints.

After completing the installation steps above and launching the server, you can view the documentation by visiting `localhost:3000/docs/`.

Clicking on the `Authorize` button in the upper right corner of the page will allow one to visit / explore the various authenticated routes.

## Heroku

!Using the `promote to ______` button will cause whatever app is promoted to to lose it's data. Only do this if you're sure you don't want to keep that data. In order to deploy changes and keep an app's data in tact go to that app's dashboard page, click `deploy` from the menu at the top of the page, then scroll down to `Manual Deploy`.

---
