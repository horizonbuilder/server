exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', t => {
    t.increments('id').primary();
    t.string('username').notNullable();
    t.string('password').notNullable();
    t.string('first');
    t.string('last');
    t.string('email');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
