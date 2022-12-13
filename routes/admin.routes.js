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
const { renderEnterPage } = require("../controllers/menuController")

router.post('/writepaying', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.writePaying)
router.post('/sendendpay', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.sendEndPay)
router.post('/finduser', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.finduser)
router.post('/finduserpage', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.finduserPageRender)

router.post('/finduserpayments', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.findUserPayments)
router.post('/deleteuser', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.deleteUser)

router.post('/payhistory', cookieJwtAdminAuth.cookAuth, adminController.getUserPaymentsData)
router.get('/payhistorypage', cookieJwtAuth, adminController.dysplayPayHistoryPage)


// router.get('/payhistorypageforadmin', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.getUserPaymentsData)
router.get('/payhistforadmin', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.payHistPageForAdmRender)
router.get('/payhistory_foradm', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.getForAdminPaymentsData)
router.get('/usersList', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.dysplayUsersList)

router.get('/usersListPag', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.getStartUsersList)


router.post('/usersListPag', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], adminController.getAnyUsersList)


module.exports = router