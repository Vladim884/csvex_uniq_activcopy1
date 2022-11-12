const Router = require("express")
const _ = require("lodash")
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
router.post('/users', cookieJwtAuth, async function(req, res){
    return res.render('service/users1')
})

router.get('/users1', cookieJwtAuth, async function(req, res){
    try {
        let currentPage = 1
        let rows = 5
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

        const pages = Math.ceil(userData.length / rows)

        const start = rows * (currentPage)
        const end = start + rows;
        const usersData = users.slice(start, end)

        const paginationData = {usersData, currentPage, rows, pages}
        return res.json({paginationData})
        // return res.render('service/users', {nicname1: 'vladim1', pagenumber3: 3})
    } catch (error) {
            console.log(error)
    }
            
})
router.post('/users1', cookieJwtAuth, async function(req, res){
    try {
        if(!req.body) return res.sendStatus(400)
        console.log('POST')
        let currentPage = req.body.currentPage
        let rows = 5
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

        const pages = Math.ceil(userData.length / rows)

        const start = rows * (currentPage)
        const end = start + rows;
        const usersData = users.slice(start, end)

        const paginationData = {usersData, currentPage, rows, pages}
        return res.json({paginationData})
        // return res.render('service/users', {nicname1: 'vladim1', pagenumber3: 3})
    } catch (error) {
            console.log(error)
    }
            
})


module.exports = router