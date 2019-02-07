exports.up = function(knex, Promise) {
  return knex.schema.table('services', t => {
    t
      .integer('order_id')
      .references('orders.id')
      .onDelete('set null');
    t
      .integer('trade_id')
      .references('trades.id')
      .onDelete('set null');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('services', t => {
    t.dropColumn('order_id');
    t.dropColumn('trade_id');
  });
};
