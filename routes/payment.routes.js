const Router = require("express")
const { getTokenUserData } = require("../controllers/authController")
const router = new Router()
const paymentController = require("../controllers/paymentController")
const UserListDto = require("../dtos/userslist-dto")
const { cookieJwtAuth } = require("../middleware/cookieJwtAuth")
const User = require("../models/User")

router.post('/writepaying', cookieJwtAuth, paymentController.writePaying)
router.post('/sendendpay', cookieJwtAuth, paymentController.sendEndPay)
router.post('/finduser', cookieJwtAuth, paymentController.finduser)
router.post('/finduserpayments', cookieJwtAuth, paymentController.findUserPayments)
router.post('/deleteuser', cookieJwtAuth, paymentController.deleteUser)

router.get('/payhistory', cookieJwtAuth, paymentController.getTokenPaymentsData)
router.get('/users', cookieJwtAuth, async function(req, res){
    try {
        const userData = await User.find()
        const users = []
        for (let i = 0; i < userData.length; i++) {
            let user = {
                nicname: userData[i].nicname,
                registrDate: userData[i].registrDate,
                email: userData[i].email,
                role: userData[i].status,
                balance: userData[i].balance,
                endDay: userData[i].endDay
            }
            users.push(user)
        }
        // console.log(users)

        let currentPage = 3
        let rows = 8

        const start = rows * (currentPage - 1)
        const end = start + rows;
        const paginatedData = users.slice(start, end)
        return res.json({paginatedData})
    } catch (error) {
            console.log(error)
    }
            
})


module.exports = router