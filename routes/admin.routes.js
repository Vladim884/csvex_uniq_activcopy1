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
const { cookieJwtAdminAuth } = require("../middleware/cookieJwtAdminAuth")

router.post('/writepaying', cookieJwtAdminAuth.cookAuth, adminController.writePaying)
router.post('/sendendpay', cookieJwtAuth, adminController.sendEndPay)
router.post('/finduser', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.finduser)
router.post('/finduserpage', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.finduserPageRender)

router.post('/finduserpayments', cookieJwtAuth, adminController.findUserPayments)
router.post('/deleteuser', cookieJwtAuth, adminController.deleteUser)

router.get('/payhistory', cookieJwtAuth, adminController.getTokenPaymentsData)
router.get('/payhistorypage', cookieJwtAuth, adminController.dysplayPayHistoryPage)
// router.get('/payhistory/:email', cookieJwtAuth, adminController.getEmailPaymentsData)
router.get('/usersList', cookieJwtAuth, adminController.dysplayUsersList)

router.get('/usersListPag', cookieJwtAuth, adminController.getStartUsersList)


router.post('/usersListPag', cookieJwtAuth, adminController.getAnyUsersList)


module.exports = router