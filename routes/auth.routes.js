const Router = require("express")
const _ = require("lodash")
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const router = new Router()
const {cookieJwtAuth} = require('../middleware/cookieJwtAuth')
const authController = require("../controllers/authController")
const paymentController = require("../controllers/paymentController")
// const { 
//         signup, 
//         activateAccount, 
//         forgotPassword, 
//         resetPassword,
//         sendEndPay,
//         getTokenUserData, 
//         getAccessToStart,
//         continueWork,
//         logout,
//         login} = require('../controllers/authController')

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
router.get('/logout', cookieJwtAuth, authController.logout)
router.get("/start", cookieJwtAuth, function(req, res){
    res.render('start.hbs')
})
router.get('/user', cookieJwtAuth, async function(req, res){
    const user = await User.findOne({email: 'vov2@gmail.com'})
    console.log(`users-users: ${user}`)
    
    res.json({user: {
            id: user.id,
            email: user.email,
            diskSpace: user.diskSpace,
            usedSpace: user.usedSpace,
            avatar: user.avatar
        }})
            
});

// router.post('/writepaying', [cookieJwtAuth], paymentController.writePaying)
// router.post('/sendendpay', cookieJwtAuth, paymentController.sendEndPay)
router.get('/usercabinet', cookieJwtAuth, authController.getTokenUserData)

module.exports = router
