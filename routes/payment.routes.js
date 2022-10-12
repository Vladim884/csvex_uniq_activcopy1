const Router = require("express")
const { getTokenUserData } = require("../controllers/authController")
const router = new Router()
const paymentController = require("../controllers/paymentController")
const { cookieJwtAuth } = require("../middleware/cookieJwtAuth")

router.post('/writepaying', cookieJwtAuth, paymentController.writePaying)
router.post('/sendendpay', cookieJwtAuth, paymentController.sendEndPay)
router.get('/payhistory', cookieJwtAuth, getTokenUserData)

module.exports = router