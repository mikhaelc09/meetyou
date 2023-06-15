'use strict';

/** @type {import('sequelize-cli').Migration} */
const faker = require('@faker-js/faker').faker;
const bcrypt = require('bcrypt');
faker.setLocale('id_ID')


module.exports = {
  async up(queryInterface, Sequelize) {
    const users = []
    for(let i = 0; i < 5; i++){
      const temp = faker.name.fullName();
      users.push({
        name: temp,
        email: temp.toLowerCase().replace(/\s/g, '') + '@gmail.com',
        password: await bcrypt.hash('123456', 10),
        zoom_id: "XsgkBVluTzGA7js7LjSzCQ",
        zoom_secret: "hLFbJiR8tdamRLOBrl2RkMFt5G5exl6M",
        balance: 0,
        tier_id: faker.datatype.number({ min: 1, max: 3 }),
        created_at: new Date(),
        updated_at: new Date()
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
