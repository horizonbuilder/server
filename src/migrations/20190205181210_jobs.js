exports.up = function(knex, Promise) {
  return knex.schema.createTable('jobs', t => {
    t.increments('id').primary();
    t.string('name');
    t.date('created_at');
    t.string('status');
    t.integer('client_id').references('clients.id');
    t
      .integer('user_id')
      .references('users.id')
      .onDelete('cascade');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('jobs');
};
