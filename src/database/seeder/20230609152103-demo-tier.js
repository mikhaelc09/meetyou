'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tiers', [
      {
        name: 'Free',
        price: 0,
        limit: 5,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Personal',
        price: 10000,
        limit: 15,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Business',
        price: 20000,
        limit: 25,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Enterprise',
        price: 40000,
        limit: 50,
        created_at: new Date(),
        updated_at: new Date(),
      }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tiers', null, {
      truncate: true,
    });
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  }
};
