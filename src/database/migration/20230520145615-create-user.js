'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      zoom_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      zoom_secret: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      zoom_key: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      google_code:{
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      balance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      tier_id:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tiers', key: 'id' },
      },
      status:{
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        defaultValue: 'ACTIVE',
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
      deleted_at: Sequelize.DATE,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};