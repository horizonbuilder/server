const dbs = require('./config/database');
module.exports = {
  test: {
    client: 'postgresql',
    connection: process.env.DATABASE_TEST_URL || process.env.DATABASE_URL || dbs.postgresdb_test,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  local: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || dbs.postgresdb_local,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || dbs.postgresdb_dev,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || dbs.postgresdb_staging,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || dbs.postgresdb_prod,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  gis: {
    client: 'postgresql',
    connection: process.env.GIS_DATABASE_URL || dbs.postgresdb_gis,
    pool: {
      min: 2,
      max: 10
    }
  }
};
