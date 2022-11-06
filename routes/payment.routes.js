const Router = require("express")
const { getTokenUserData } = require("../controllers/authController")
const router = new Router()
const paymentController = require("../controllers/paymentController")
const { cookieJwtAuth } = require("../middleware/cookieJwtAuth")

router.post('/writepaying', cookieJwtAuth, paymentController.writePaying)
router.post('/sendendpay', cookieJwtAuth, paymentController.sendEndPay)
router.post('/finduser', cookieJwtAuth, paymentController.finduser)
router.post('/finduserpayments', cookieJwtAuth, paymentController.findUserPayments)
router.post('/deleteuser', cookieJwtAuth, paymentController.deleteUser)

router.get('/payhistory', cookieJwtAuth, paymentController.getTokenPaymentsData)


module.exports = router