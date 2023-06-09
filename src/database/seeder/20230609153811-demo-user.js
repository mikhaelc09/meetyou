'use strict';

/** @type {import('sequelize-cli').Migration} */
const faker = require('@faker-js/faker').faker;
const bcrypt = require('bcrypt');
faker.setLocale('id_ID')


module.exports = {
  async up(queryInterface, Sequelize) {
    const users = []
    for(let i = 0; i < 20; i++){
      const temp = faker.name.fullName();
      users.push({
        nama: temp,
        email: temp.toLowerCase().replace(/\s/g, '') + '@gmail.com',
        password: await bcrypt.hash('123', 10),
        saldo: 0,
        tier_id: faker.datatype.number({ min: 1, max: 3 }),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    await queryInterface.bulkDelete('users', null, {
      truncate: true,
    });
  }
};
