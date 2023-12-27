const { Model, DataTypes } = require('sequelize');
const sequelize = require('./db');

class User extends Model {}

User.init({
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'User'
});

module.exports = User;
