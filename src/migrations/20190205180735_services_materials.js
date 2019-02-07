exports.up = function(knex, Promise) {
  return knex.schema.createTable('services_materials', t => {
    t.increments('id').primary();
    t.string('name');
    t.integer('quantity');
    t.string('unit');
    t.float('cost_per_unit');
    t.float('supplier_cost');
    t.float('profit');
    t
      .integer('service_id')
      .references('services.id')
      .onDelete('cascade');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('services_materials');
};
