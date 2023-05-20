'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invite extends Model {
    static associate(models) {
      Invite.belongsTo(models.Meet, {
        foreignKey: 'meet_id',
        as: 'meet',
      });
      Invite.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
    }
  }
  Invite.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    meet_id:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status:{
      type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
      defaultValue: 'PENDING',
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Invite',
    tableName: 'invites',
    timestamps: true,
    paranoid: true,
    underscored: true,
  });
  return Invite;
};