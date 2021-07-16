const http = require('http')
const {Server} = require('socket.io')
const express = require('express')
const {validationResult} = require('express-validator')
const ApiError = require('../exceptions/api-error')
const userService = require('../service/user-service')
const tokenService = require('../service/token-service')

class UserController {
    async registration(req, res, next){
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Validation error', errors.array()))
            }
            const {first_name, last_name, email, phone, password} = req.body
            const userData = await userService.registration(first_name, last_name, email, phone, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }
    async login(req, res, next){
        try {
            const {email, password} = req.body
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }
    async logout(req, res, next){
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            next(e)
        }
    }
    async refresh(req, res, next){
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        } catch (e) {
            next(e)
        }
    }
    async getUser(req, res, next){
        try {
            const {id} = req.params
            const user = await userService.getUser({id});
            return res.json(user)
        } catch (e) {
            next(e)
        }
    }
    async update(req, res, next){
        try {
            const app = express();
            const server = http.createServer(app)
            const io = new Server(server)
            const {first_name, last_name, email, phone, password} = req.body
            const  data = await tokenService.getDataByToken(req.headers)
            const newUser = await userService.update({first_name, last_name, email, phone}, password, data.email);
            io.emit('new_notification', {
                message: "User updated",
                title: "New notification",
            });
            return res.json(newUser)
        } catch (e) {
            next(e)
        }
    }
}

module.exports = new UserController()
