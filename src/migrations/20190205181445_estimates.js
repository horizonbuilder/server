exports.up = function(knex, Promise) {
  return knex.schema.createTable('estimates', t => {
    t.increments('id').primary();
    t.float('shipping');
    t.float('taxes');
    t
      .integer('job_id')
      .references('jobs.id')
      .onDelete('cascade');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('estimates');
};
