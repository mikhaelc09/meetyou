'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tiers', [
      {
        name: 'Free',
        price: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Personal',
        price: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Business',
        price: 20000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Enterprise',
        price: 30000,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tiers', null, {
      truncate: true,
    });
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  }
};
