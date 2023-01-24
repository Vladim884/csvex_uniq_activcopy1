const Router = require("express")
const {check, validationResult} = require("express-validator")
const router = new Router()
const {cookieJwtAuth} = require('../middleware/cookieJwtAuth')
const authController = require("../controllers/authController")

router.get("/registration", authController.registrationPageRender)
router.get("/forgpass", authController.forgpassPageRender)
router.get("/resetpass", authController.resetpassPageRender)
router.get("/activate", authController.activatePageRender)

router.get('/usercabinet', cookieJwtAuth, authController.getTokenUserData)
router.get('/userstatus', cookieJwtAuth, authController.getTokenUserRole)

router.post('/registration',
    [
        check('email', "Uncorrect email").isEmail(),
        check('password', 'Password must be longer than 3 and shorter than 12').isLength({min:3, max:12})
    ],
    authController.signup
)
   
router.post('/email-activate', authController.activateAccount)
router.post('/forgot-password', authController.forgotPassword)
router.post('/resset-pass', authController.resetPassword)
router.post('/login', authController.login)

module.exports = router
