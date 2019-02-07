exports.up = function(knex, Promise) {
  return knex.schema.createTable('orders', t => {
    t.increments('id').primary();
    t
      .integer('job_id')
      .references('jobs.id')
      .onDelete('cascade');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('orders');
};
