const Router = require("express")
const _ = require("lodash")
const { getTokenUserData } = require("../controllers/authController")
const router = new Router()
const adminController = require("../controllers/adminController")
const UserListDto = require("../dtos/userslist-dto")
const { cookieJwtAuth } = require("../middleware/cookieJwtAuth")
const User = require("../models/User")

router.post('/writepaying', cookieJwtAuth, adminController.writePaying)
router.post('/sendendpay', cookieJwtAuth, adminController.sendEndPay)
router.post('/finduser', cookieJwtAuth, adminController.finduser)
router.post('/finduserpayments', cookieJwtAuth, adminController.findUserPayments)
router.post('/deleteuser', cookieJwtAuth, adminController.deleteUser)

router.get('/payhistory', cookieJwtAuth, adminController.getTokenPaymentsData)
// router.get('/payhistory/:email', cookieJwtAuth, adminController.getEmailPaymentsData)
router.post('/users', cookieJwtAuth, async function(req, res){
    return res.render('service/usersList')
})

router.get('/usersList', cookieJwtAuth, adminController.getStartUsersList)


router.post('/usersList', cookieJwtAuth, adminController.getAnyUsersList
// async function(req, res, next){
//     if(!req.body) return res.sendStatus(400)
//     try {
//         if (req.body.currentPage){
            
//                 let currentPage = req.body.currentPage
//                 let rows = 4
//                 const allUsersData = await User.find()
        
//                 const pages = Math.ceil(allUsersData.length / rows)
        
//                 const start = rows * currentPage
//                 const end = start + rows
//                 const usersData = allUsersData.slice(start, end)
        
//                 const users = []
//                 for (let i = 0; i < usersData.length; i++) {
//                     let user = {
//                         nicname: usersData[i].nicname,
//                         registrDate: usersData[i].registrDate,
//                         email: usersData[i].email,
//                         role: usersData[i].status,
//                         balance: usersData[i].balance,
//                         endDay: usersData[i].endDay
//                     }
//                     users.push(user)
//                 }
//                 // console.log(users)
//                 const paginationData = {users}
//                 return res.json({paginationData})
//             // } catch (error) {
//             //         console.log(error)
//             //         next(error)
//             // }
//         } else {

//             let currentPortion = req.body.currentPortion
                
//             let currentPage = 0
//             let rows = 4
//             const allUsersData = await User.find()

//             const pages = Math.ceil(allUsersData.length / rows)
//             console.log(`pages: ${pages}`)

//             //portionSize - count pagination button on 1 page
//             let portionSize = 5
//             //portions - count all pagination button
//             // const portions = Math.ceil(pages / portionSize)

            
//             let start = (currentPortion - 1) * portionSize * rows
//             // console.log(`start: ${start}`)
//             // const end = currentPortion * portionSize
//             const end = start + rows

            

//             // const start = rows * currentPage
//             // const end = start + rows;
//             const usersData = allUsersData.slice(start, end)

//             const users = []
//             for (let i = 0; i < usersData.length; i++) {
//                 let user = {
//                     nicname: usersData[i].nicname,
//                     registrDate: usersData[i].registrDate,
//                     email: usersData[i].email,
//                     role: usersData[i].status,
//                     balance: usersData[i].balance,
//                     endDay: usersData[i].endDay
//                 }
//                 users.push(user)
//             }
//             // console.log(users)

//             const paginationData = {users}
//             return res.json({paginationData})
//             // return res.render('service/users', {nicname1: 'vladim1', pagenumber3: 3})
//         } 

//     }catch (error) {
//         console.log(error)
//     }
// }
)


module.exports = router