exports.up = function(knex, Promise) {
  return knex.schema.createTable('jobs_files', t => {
    t.increments('id').primary();
    t.string('file_url');
    t.string('group');
    t.string('description');
    t
      .integer('job_id')
      .references('jobs.id')
      .onDelete('cascade');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('jobs_files');
};
