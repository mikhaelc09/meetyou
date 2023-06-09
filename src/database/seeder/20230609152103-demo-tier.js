'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tiers', [
      {
        nama: 'Free',
        harga: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nama: 'Personal',
        harga: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nama: 'Business',
        harga: 20000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nama: 'Enterprise',
        harga: 30000,
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
