const {User} = require('../models/models')
const bcrypt = require('bcrypt')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')

class UserService{

    async registration(first_name, last_name, email, phone, password) {
        const candidate = await User.findOne({where: {email}})
        if(candidate) {
            throw ApiError.BadRequest(`User with email ${email} is registed`)
        }
        const hashPassword = await bcrypt.hash(password, 8)
        const user = await User.create({first_name, last_name, email, phone, password: hashPassword})
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }

    async login(email, password){
        const user = await User.findOne({where: {email}})
        if(!user) {
            throw ApiError.BadRequest(`User with this email is not found`)
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if(!isPassEquals) {
            throw ApiError.BadRequest(`Password is incorrect`)
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }
    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if(!refreshToken) {
            throw ApiError.UnauthorizedError()
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDb = await tokenService.findToken(refreshToken)
        if(!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError()
        }
        const user = await User.findOne(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    async getUser(id){
        const user = await User.findOne({where: id});
        return user;
    }

    async update(newUser, password, email){
        const hashPassword = await bcrypt.hash(password, 8)
        const user = await User.findOne({where: {email}});
        await User.update({...newUser, password: hashPassword}, {where: {id: user.id}})
        const userDto = new UserDto({...newUser, id: user.id});
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }
}

module.exports = new UserService()
