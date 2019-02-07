import * as knex from 'knex';
const environment = process.env.NODE_ENV || 'local';
const config = require('../knexfile.js');

export default knex(config[environment]);
export function knexForEnv(env: string) {
  return knex(config[env]);
}
