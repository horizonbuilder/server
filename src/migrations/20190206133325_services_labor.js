exports.up = function(knex, Promise) {
  return knex.schema.createTable('services_labor', t => {
    t.increments('id').primary();
    t.string('description');
    t.float('hours');
    t.float('cost_per_hour');
    t
      .integer('service_id')
      .references('services.id')
      .onDelete('cascade');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('services_labor');
};
