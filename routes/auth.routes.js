const Router = require("express")
const _ = require("lodash")
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const router = new Router()
const {cookieJwtAuth} = require('../middleware/cookieJwtAuth')
const {writePaying} = require('../controllers/paymentController')
const { 
        signup, 
        activateAccount, 
        forgotPassword, 
        resetPassword,
        sendEndPay,
        getTokenUserData, 
        getAccessToStart,
        continueWork,
        logout,
        login} = require('../controllers/authController')

router.post('/registration',
    [
        check('email', "Uncorrect email").isEmail(),
        check('password', 'Password must be longer than 3 and shorter than 12').isLength({min:3, max:12})
    ],
    signup)
   
router.post('/email-activate', activateAccount)
router.post('/forgot-password', forgotPassword)
router.post('/resset-pass', resetPassword)
router.post('/login', login)
router.get('/logout', cookieJwtAuth, logout)
router.get("/start", cookieJwtAuth, function(req, res){
    res.render('start.hbs')
})
router.get('/user', cookieJwtAuth, async function(req, res){
    const user = await User.findOne({email: 'vov2@gmail.com'})
    console.log(`users-users: ${user}`)
    // res.end({user: `${user}`})
    // res.end({user: {
    //     id: user.id,
    //     email: user.email,
    //     diskSpace: user.diskSpace,
    //     usedSpace: user.usedSpace,
    //     avatar: user.avatar
    // }});
    res.json({user: {
            id: user.id,
            email: user.email,
            diskSpace: user.diskSpace,
            usedSpace: user.usedSpace,
            avatar: user.avatar
        }})
            
});

router.post('/writepaying', [cookieJwtAuth], writePaying)
router.post('/sendendpay', cookieJwtAuth, sendEndPay)
router.get('/usercabinet', cookieJwtAuth, getTokenUserData)
router.get('/payhistory', cookieJwtAuth, getTokenUserData)

module.exports = router
