const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    first_name: {type: DataTypes.TEXT, allowNull: false},
    last_name: {type: DataTypes.TEXT},
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    phone: {type: DataTypes.INTEGER},
    password: {type: DataTypes.STRING, allowNull: false},
})

const Token = sequelize.define('token', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
    refreshToken: {type: DataTypes.STRING, allowNull: false}
})

User.hasOne(Token)
Token.belongsTo(User)

module.exports = {
    User,
    Token
}
