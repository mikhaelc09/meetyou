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
        name: temp,
        email: temp.toLowerCase().replace(/\s/g, '') + '@gmail.com',
        password: await bcrypt.hash('123456', 10),
        balance: 0,
        tier_id: faker.datatype.number({ min: 1, max: 3 }),
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // await queryInterface.bulkInsert('users', [{
    //   name: 'Daniel',
    //   email: 'danielgamaliel06@gmail.com',
    //   password: await bcrypt.hash('123', 10),
    //   balance: 0,
    //   tier_id: 1,
    //   zoom_key: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IjZhejJ6eDA3U19XaU0wVmhBR2szM2ciLCJleHAiOjE2ODY5MzQ4MTcsImlhdCI6MTY4NjMzMDAxN30.xucT30_lLz4G7poBL4q-mZopFb-k6-6K5Sx9gjBhS6Q',
    //   created_at: new Date(),
    //   updated_at: new Date()
    // }], {})
    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    await queryInterface.bulkDelete('users', null, {
      truncate: true,
    });
  }
};
