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
    return res.render('service/usersList')
})

router.get('/usersList', cookieJwtAuth, async function(req, res){
    try {
        let currentPage = 0
        let rows = 3
        const allUsersData = await User.find()

        const pages = Math.ceil(allUsersData.length / rows)

        const start = rows * currentPage
        const end = start + rows;
        const usersData = allUsersData.slice(start, end)

        const users = []
        for (let i = 0; i < usersData.length; i++) {
            let user = {
                nicname: usersData[i].nicname,
                registrDate: usersData[i].registrDate,
                email: usersData[i].email,
                role: usersData[i].status,
                balance: usersData[i].balance,
                endDay: usersData[i].endDay
            }
            users.push(user)
        }
        // console.log(users)

        

        const paginationData = {users, currentPage, rows, pages}
        return res.json({paginationData})
        // return res.render('service/users', {nicname1: 'vladim1', pagenumber3: 3})
    } catch (error) {
            console.log(error)
    }
            
})
router.post('/usersList', cookieJwtAuth, async function(req, res, next){
    try {
        if(!req.body) return res.sendStatus(400)
        let currentPage = req.body.currentPage
        let rows = 3
        const allUsersData = await User.find()

        const pages = Math.ceil(allUsersData.length / rows)

        const start = rows * currentPage
        const end = start + rows;
        const usersData = allUsersData.slice(start, end)

        const users = []
        for (let i = 0; i < usersData.length; i++) {
            let user = {
                nicname: usersData[i].nicname,
                registrDate: usersData[i].registrDate,
                email: usersData[i].email,
                role: usersData[i].status,
                balance: usersData[i].balance,
                endDay: usersData[i].endDay
            }
            users.push(user)
        }
        // console.log(users)

        

        const paginationData = {users, currentPage, rows, pages}
        return res.json({paginationData})
        // return res.render('service/users', {nicname1: 'vladim1', pagenumber3: 3})
    } catch (error) {
            console.log(error)
            next(error)
    }
            
})


module.exports = router