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
        const currentPortion = 1
        let currentPage = 0
        let rows = 3
        const allUsersData = await User.find()

        const pages = Math.ceil(allUsersData.length / rows)

        //portion - count pagination button on 1 page
        let portionSize = 4
        //portions - count all pagination button
        const portions = Math.ceil(pages / portionSize)

        
        let start = (currentPortion - 1) * portionSize
        console.log(`start: ${start}`)
        // const end = currentPortion * portionSize

        

        // const start = rows * currentPage
        const end = start + rows
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

        

        const paginationData = {users, currentPage, rows, pages, currentPortion, portionSize, start, portions}
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
        const end = start + rows
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

router.post('/usersList1', cookieJwtAuth, async function(req, res, next){
    try {
        if(!req.body) return res.sendStatus(400)
        let currentPortion = req.body.currentPortion
        
            let currentPage = 0
            let rows = 3
            const allUsersData = await User.find()
    
            const pages = Math.ceil(allUsersData.length / rows)
            console.log(`pages: ${pages}`)
    
            //portion - count pagination button on 1 page
            let portionSize = 4
            //portions - count all pagination button
            const portions = Math.ceil(pages / portionSize)
    
            
            let start = (currentPortion - 1) * portionSize * rows
            console.log(`start: ${start}`)
            // const end = currentPortion * portionSize
            const end = start + rows
    
            
    
            // const start = rows * currentPage
            // const end = start + rows;
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
    
            
    
            const paginationData = {users, currentPage, rows, pages, currentPortion, portionSize, portions}
            return res.json({paginationData})
            // return res.render('service/users', {nicname1: 'vladim1', pagenumber3: 3})
        } catch (error) {
                console.log(error)
        }
            
})


module.exports = router