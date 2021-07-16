const Router = require('express').Router
const userController = require('../controllers/user-controller')
const router = new Router();
const {body} = require('express-validator')
const authMiddleware = require('../middlewares/auth-midleware')


router.post('/registration',
    body('email').isEmail(),
    body('first_name').isAlpha(),
    body('last_name').isAlpha(),
    body('phone').isMobilePhone(),
    userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/refresh', userController.refresh)
router.get('/user/:id', userController.getUser)
router.post('/update',
    body('email').isEmail(),
    body('first_name').isAlpha(),
    body('last_name').isAlpha(),
    body('phone').isMobilePhone(),
    authMiddleware,
    userController.update)

module.exports = router
