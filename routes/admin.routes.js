const Router = require("express")
const _ = require("lodash")
const { getTokenUserData } = require("../controllers/authController")
const router = new Router()
const adminController = require("../controllers/adminController")
const UserListDto = require("../dtos/userslist-dto")
const { cookieJwtAuth } = require("../middleware/cookieJwtAuth")
const User = require("../models/User")
const userService = require("../services/userService")
const { getUserfromToken } = require("../myFunctions/myFunctions")

router.post('/writepaying', cookieJwtAuth, adminController.writePaying)
router.post('/sendendpay', cookieJwtAuth, adminController.sendEndPay)
router.post('/finduser', cookieJwtAuth, adminController.finduser)
router.post('/finduserpayments', cookieJwtAuth, adminController.findUserPayments)
router.post('/deleteuser', cookieJwtAuth, adminController.deleteUser)

router.get('/payhistory', cookieJwtAuth, adminController.getTokenPaymentsData)
router.get('/payhistorypage', cookieJwtAuth, adminController.dysplayPayHistoryPage)
// router.get('/payhistory/:email', cookieJwtAuth, adminController.getEmailPaymentsData)
router.get('/usersList', cookieJwtAuth, adminController.dysplayUsersList)

router.get('/usersListPag', cookieJwtAuth, adminController.getStartUsersList)


router.post('/usersListPag', cookieJwtAuth, adminController.getAnyUsersList)


module.exports = router