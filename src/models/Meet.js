'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Meet extends Model {
    static associate(models) {
      Meet.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
      });
      Meet.hasMany(models.Invite, {
        foreignKey: 'meet_id',
        as: 'invites',
      });
    }
  }
  Meet.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nama: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.STRING(255),
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    waktu: {
      type: DataTypes.DATETIME,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
    modelName: 'Meet',
    tableName: 'meets',
    timestamps: true,
    paranoid: true,
    underscored: true,
  });
  return Meet;
};