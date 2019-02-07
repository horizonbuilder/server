exports.up = function(knex, Promise) {
  return knex.schema.createTable('trades', t => {
    t.increments('id').primary();
    t.string('name');
    t
      .integer('estimate_id')
      .references('estimates.id')
      .onDelete('cascade');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('trades');
};
