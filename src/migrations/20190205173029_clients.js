exports.up = function(knex, Promise) {
  return knex.schema.createTable('clients', table => {
    table.increments('id').primary();
    table.string('name');
    table.string('address');
    table.string('phone');
    table.string('email');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('clients');
};
