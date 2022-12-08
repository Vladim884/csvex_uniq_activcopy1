const Router = require("express")
const _ = require("lodash")
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const router = new Router()
const {cookieJwtAuth} = require('../middleware/cookieJwtAuth')
const authController = require("../controllers/authController")
const paymentController = require("../controllers/adminController")
const tokenService = require("../services/tokenService")

router.get("/registration", function(req, res){
    res.render('auth/registration.hbs')
})
router.post('/registration',
    [
        check('email', "Uncorrect email").isEmail(),
        check('password', 'Password must be longer than 3 and shorter than 12').isLength({min:3, max:12})
    ],
    authController.signup)
   
router.post('/email-activate', authController.activateAccount)
router.post('/forgot-password', authController.forgotPassword)
router.post('/resset-pass', authController.resetPassword)
router.post('/login', authController.login)
router.get("/activate", function(req, res){
    res.render('auth/activate.hbs')
})
router.put('/users', cookieJwtAuth, async function(req, res){
    let num = req.body.num
    console.log(num)
})



router.get('/usercabinet', cookieJwtAuth, authController.getTokenUserData)
router.get('/userstatus', cookieJwtAuth, authController.getTokenUserRole)

module.exports = router
