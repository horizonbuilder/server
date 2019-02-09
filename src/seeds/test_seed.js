const bcrypt = require('bcryptjs');

exports.seed = function(knex, Promise) {
  return knex
    .raw(
      `
    delete from jobs;
    delete from estimates;
    delete from orders;
    delete from trades;
    delete from services;
    delete from services_materials;
    delete from services_labor;
    alter sequence jobs_id_seq restart with 1;
    alter sequence estimates_id_seq restart with 1;
    alter sequence orders_id_seq restart with 1;
    alter sequence trades_id_seq restart with 1;
    alter sequence services_id_seq restart with 1;
    alter sequence services_materials_id_seq restart with 1;
    alter sequence services_labor_id_seq restart with 1;
  `
    )
    .then(() => {
      return knex('users').insert([
        {
          username: 'test',
          password: bcrypt.hashSync('test', bcrypt.genSaltSync())
        }
      ]);
    })
    .then(() => {
      return knex('jobs').insert([
        { name: 'job 1', user_id: 1, status: 'in-progress' },
        { name: 'job 2', user_id: 1, status: 'in-progress' }
      ]);
    })
    .then(() => {
      return knex('estimates').insert([{ job_id: 1 }, { job_id: 2 }]);
    })
    .then(() => {
      return knex('orders').insert([{ job_id: 1 }]);
    })
    .then(() => {
      return knex('trades').insert([{ estimate_id: 1, name: 'Roofing' }]);
    })
    .then(() => {
      return knex('services').insert([
        { name: 'Remove old shingles', trade_id: 1, order_id: 1 },
        { name: 'Install new shingles', trade_id: 1 }
      ]);
    })
    .then(() => {
      return knex('services_materials').insert([
        {
          service_id: 1,
          name: 'shingles',
          quantity: 100,
          unit: 'pieces',
          cost_per_unit: 10,
          supplier_cost: 5,
          profit: 50
        }
      ]);
    })
    .then(() => {
      return knex('services_labor').insert([
        { service_id: 1, description: 'install shingles', hours: 40, cost_per_hour: 100 }
      ]);
    });
};
