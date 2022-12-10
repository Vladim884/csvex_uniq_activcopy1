const User = require("../models/User")
const _ = require("lodash")
const jwt = require("jsonwebtoken")
const config = require("config")
const moment = require("moment")
const alert = require("alert")
const PaymentsDto = require('../dtos/payments-dto')
const {check, validationResult} = require("express-validator")



const {
    formatDate, 
    formatNowDate, 
    clg,
    emailOptionsSend,
    getNumberOfDays, 
    getUserfromToken,
    decryptToken
} = require('../myFunctions/myFunctions')
const mailer = require("../nodemailer/nodemailer")
const userService = require("../services/userService")
const { findOne } = require("../models/User")



class adminController {
    
    

    async writePaying (req, res, next) {
        let token = req.cookies.token
        let admin
            if(token){
                admin = await getUserfromToken(token)
            } else {
                const {refreshToken} = req.cookies
                    if(!refreshToken){
                        return res.status(403).json({"message": "systemContr/upload Ви не авторизувались(!token)"})
                    } else {
                        const refData = await userService.refresh(refreshToken)
                        res.cookie('refreshToken', refData.refreshToken, {
                            maxAge: 24*30*60*60*1000,
                            httpOnly: true
                        })
                        token = refData.token
                        admin = await getUserfromToken(token)
                        
                    }
            }
        console.log(`admin: ${admin}`)
        const datatoken = jwt.verify(token, config.get('JWT_ACC_ACTIVATE'))
        let userRole = admin.status
        console.log(`userRole: ${userRole}`)
        if(userRole !== 'admin') return res.render('msg', {msg: 'У Вас не має права доступу!'})
        let {email, sumpay} = req.body
        console.log(email)
        let user = await User.findOne({email})
            if (!user) {
                return res.status(404).json({message: "User not found"})
            }
        //==================
        let number = ++user.paymentNumber
        user.paymentNumber = number
        user.payments.push({number, date: moment().format(), sum: sumpay})
        //==================
        
        let lastPayment = user.payments[user.payments.length - 1]
        const today = lastPayment.date
        user.payingDate = today
        //=================================
        //Кол-во новых оплаченных дней: 
        let daysPayingLast = lastPayment.sum / (100/30)
        if(daysPayingLast < 0) daysPayingLast = 0
        console.log(daysPayingLast)
        //=====================
        //Кол-во новіх оплаченных минут: 
        let minutessPaying = daysPayingLast*24*60
        // console.log(`minutessPaying: ${minutessPaying}`)

        //сколько минут остлось с предыдущей оплаты
        var a = moment(today);
        var b = moment(user.endDay);
        let diffMinutes = b.diff(a, 'minutes')
        if (diffMinutes < 0) diffMinutes = 0

        // сколько теперь осталось оплаченных минут sumpay???
        let sumMinutesLast = diffMinutes + minutessPaying
        console.log(`сколько теперь осталось оплаченных минут: ${sumMinutesLast}`)

        //конечная дата оплаченных дней:
        const endDay = moment(today).add(sumMinutesLast, 'minutes')
        user.endDay = endDay;
        console.log(`endDay: ${endDay}`)

        
        const balance = (100/30/24/60) * sumMinutesLast
        // console.log(`balance: ${balance}`)


        
        


       
    
        //оплачено за все время:
        user.sumpay = +user.sumpay + +lastPayment.sum
        // console.log(`user.sumpay: ${user.sumpay}`)
        //===========================
        user.balance = balance
        //итоговое количество оставшихся дней
        user.daysLeft = sumMinutesLast /60/24
            
        // let obj1 = {
        //     payingDate: lastPayment.date,
        // }
        // user = _.extend(user, obj1)
        user.save((err, result) => {
            if(err){
                return res.status(400).render('msg', {msg: `Помилка зміни оплати користувача з email: "${email}"`})
            } else {
                // console.log(`7 lastPayment.date: ${lastPayment.date}`)
                let payingDateForPeople = formatNowDate(lastPayment.date)
                const message = {
                    to: 'ivladim95@gmail.com',
                    subject: 'Оплата послуги на CSV TO EXCEL',
                    html: `
                        <h4>${user.nicname}, Вас вітає команда CSV TO EXCEL!</h4>
                        <p>Дякуємо, що Ви обрали наш сервіс!</p>
                        <p>${payingDateForPeople} Ви оплатили ${sumpay}грн. </p>
                        <p>та отримали активацію сервісу CSV TO EXCEL на ${daysPayingLast} днів.</p>
                        `
                }
                mailer(message)
                return res.status(200).render('msg', {msg: `Оплату користувача з email: "${email}" успішно змінено`})
            }
        })
    }

    async finduserPageRender (req, res, next) {
        const {email} = req.body
        return res.render('service/adminserv/userdata', {inputEmVal: email})
    }

    async finduser (req, res, next) {
        // async function userRoleDefer(req, res) {
        //     let token = req.cookies.token
        //     let refreshToken = req.cookies.refreshToken
        //     let admin
        
        //     if(token){
        //         admin = await getUserfromToken(token)
        //     } else {
        //         if(!refreshToken){
        //             return res.status(403).json({"message": "systemContr/upload Ви не авторизувались(!token)"})
        //         } else {
        //             const refData = await userService.refresh(refreshToken)
        //             res.cookie('refreshToken', refData.refreshToken, {
        //                 maxAge: 24*30*60*60*1000,
        //                 httpOnly: true
        //             })
        //             token = refData.token
        //             admin = await getUserfromToken(token)
        //             return admin
        //         }
        //     }
        // }
        
        try {
            // userRoleDefer(req, res)
            
            // let token = req.cookies.token
            // let refreshToken = req.cookies.refreshToken
            // let admin

            // if(token){
            //     admin = await getUserfromToken(token)
            // } else {
            //     if(!refreshToken){
            //         return res.status(403).json({"message": "systemContr/upload Ви не авторизувались(!token)"})
            //     } else {
            //         const refData = await userService.refresh(refreshToken)
            //         res.cookie('refreshToken', refData.refreshToken, {
            //             maxAge: 24*30*60*60*1000,
            //             httpOnly: true
            //         })
            //         token = refData.token
            //         admin = await getUserfromToken(token)
            //     }
            // }
            
            // const userRole = admin.status
            // // const userRole = await userRoleDefer()
            // console.log(`userRole: ${userRole}`)
            // if(userRole !== 'admin') return res.render('msg', {msg: 'У Вас не має права доступу!'})

            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Uncorrect request", errors})
            }
            console.log('start finduser')
            const {email} = req.body
            console.log(email)
            const user = await User.findOne({email})
            if (!user) return res.status(404).render('error', {errorMsg: `юзера з email: "${email}" не знайдено`})

            res.json({user})
                
        } catch (err) {
            console.log(err)
            return res.render('error', {msg: 'err'})
        }
    }

    async findUserPayments (req, res, next) {
        try {
            let token = req.cookies.token
        let admin
            if(token){
                admin = await getUserfromToken(token)
                // console.log(`findUserPayments-token-admin`)
                
            } else {
                const {refreshToken} = req.cookies
                    if(!refreshToken){
                        return res.status(403).render('error', {msg: "systemContr/upload Ви не авторизувались(!token)"})
                    } else {
                        const refData = await userService.refresh(refreshToken)
                        // console.log(`paymentController/writePaying-refData: ${refData.token}`)
                        res.cookie('refreshToken', refData.refreshToken, {
                            maxAge: 24*30*60*60*1000,
                            httpOnly: true
                        })
                        token = refData.token
                        admin = await getUserfromToken(token)
                        // console.log(`findUserPayments-ref-token-admin`)
                        
                    }
            }

            // console.log(`admin: ${admin}`)
            // const datatoken = jwt.verify(token, config.get('JWT_ACC_ACTIVATE'))
            let userRole = admin.status
            // console.log(`userRole: ${userRole}`)
            if(userRole !== 'admin') return res.status(403).render('error', {msg: 'У Вас не має права доступу!'})


            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Uncorrect request", errors})
            }
            console.log('start finduser')
            const {email} = req.body
            const user = await User.findOne({email})
            if (!user) return res.status(404).render('error', {errorMsg: `юзера з email: "${email}" не знайдено`})
            // console.log(`users-users: ${user}`)
            let payments = user.payments
    
            res.json({payments})
            
        } catch (err) {
            console.log(err)
        }
        
    }

    async deleteUser (req, res, next) {
        try {
            let token = req.cookies.token
            let admin
            if(token){
                admin = await getUserfromToken(token)
                
            } else {
                const {refreshToken} = req.cookies
                    if(!refreshToken){
                        return res.status(403).render('error', {msg: "systemContr/upload Ви не авторизувались(!token)"})
                    } else {
                        const refData = await userService.refresh(refreshToken)
                        // console.log(`paymentController/writePaying-refData: ${refData.token}`)
                        res.cookie('refreshToken', refData.refreshToken, {
                            maxAge: 24*30*60*60*1000,
                            httpOnly: true
                        })
                        token = refData.token
                        admin = await getUserfromToken(token)
                    }
            }
            // console.log(`admin: ${admin}`)
            // const datatoken = jwt.verify(token, config.get('JWT_ACC_ACTIVATE'))
            let userRole = admin.status
            console.log(`userRole: ${userRole}`)
            if(userRole !== 'admin') return res.status(405).render('error', {msg: 'У Вас не має права доступу!'})


            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).render('error', {msg: "Некоректеий запрос", er: errors})
            }
            // console.log('start finduser')
            const {email} = req.body
            const user = await User.findOne({email})
            if (!user) return res.status(404).render('error', {msg: `Користувача з email: "${email}" не знайдено`})

            // console.log(`users-users: ${user}`)
    
            await User.deleteOne({email})
            res.status(200).render('msg', {msg: `Користувача з email: "${email}" видалено`})
            
        } catch (err) {
            console.log(err)
            render('error', {msg: err})
        }
        
    }

    async sendEndPay (req, res) {
        try {
            const users = await User.find()
            console.log(users)
            for (let i = 0; i < users.length; i++) {
                const restDay = Math.round((users[i].endDay - new Date()) / (60 * 60 * 24 * 1000))
                clg('restDay', `${restDay}`)
                if (restDay < 9 && restDay > 0){
                        let nowday = formatNowDate()
                        let endDay = formatDate(restDay)
                        clg('endDay', `${endDay}`)
                        const message = {
                            to: 'ivladim95@gmail.com',
                            subject: 'Оплата послуги на CSV TO EXCEL',
                            html: `
                                <h4>Доброго дня! ${users[i].nicname}, Вас вітає команда CSV TO EXCEL!</h4>
                                <p> Дякуємо, що Ви обрали наш сервіс!</p>
                                <p>Сьогодні ${nowday} у Вас залишилось ${restDay} днів до ${endDay} включно.</p>
                                <p>Потурбуйтеся про своєчасну оплату сервісу!</p>
                                `
                        }
                        
                        
                        setTimeout(() => {mailer(message)}, 5000);
                } else {
                    return res.status(200).render('msg', {msg: `Користувачів, в яких строк дії послуги закінчується, не знайдено.`})
                }
                
            }
            // alert('Завершено')
            res.status(200).render('msg', {msg: 'Листи о скором завершенні дії сервісу відправлено'})
        } catch (error) {
            console.log(error)
            res.status(400).render('error', {msg: error})
        }
    }

    async dysplayPayHistoryPage (req, res, next){
        try {
            return res.render('service/userserv/payhistory')
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    async dysplayUsersList (req, res, next){
        try {
            let token = req.cookies.token
        let refreshToken = req.cookies.refreshToken
        let admin
    
        if(token){
            admin = await getUserfromToken(token)
        } else {
            if(!refreshToken){
                return res.status(403).json({"message": "systemContr/upload Ви не авторизувались(!token)"})
            } else {
                const refData = await userService.refresh(refreshToken)
                res.cookie('refreshToken', refData.refreshToken, {
                    maxAge: 24*30*60*60*1000,
                    httpOnly: true
                })
                token = refData.token
                admin = await getUserfromToken(token)
            }
        }
        
        const userRole = admin.status
        // const userRole = await userRoleDefer()
        console.log(`userRole: ${userRole}`)
        if(userRole !== 'admin') return res.render('msg', {msg: 'У Вас не має права доступу!'})
        return res.render('service/adminserv/usersList')
        } catch (err) {
            console.log(err)
            next(err)
        }
        
    }

    async getStartUsersList(req, res, next){
        try {
            const currentPortion = 1
            let currentPage = 0
            let rows = 4
            const allUsersData = await User.find()
    
            const pages = Math.ceil(allUsersData.length / rows)
    
            //portion - count pagination button on 1 page
            let portionSize = 5
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
                    endDay: usersData[i].endDay,
                    id: usersData[i]._id
                }
                users.push(user)
            }
            // console.log(users)
    
            
    
            const paginationData = {users, currentPage, rows, pages, currentPortion, portionSize, start, portions}
            // const paginationData = {users, currentPage, pages}
            return res.json({paginationData})
            // return res.render('service/users', {nicname1: 'vladim1', pagenumber3: 3})
        } catch (error) {
                console.log(error)
        }
                
    }

    async getAnyUsersList(req, res, next){
        if(!req.body) return res.sendStatus(400)
        // for currentPage or currentPortion ?
        try {
            if (req.body.currentPage){
                
                    let currentPage = req.body.currentPage
                    let rows = 4
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
                            endDay: usersData[i].endDay,
                            id: usersData[i]._id
                        }
                        users.push(user)
                    }
                    // console.log(Object.values(users))
                    const paginationData = {users}
                    return res.json({paginationData})
                // } catch (error) {
                //         console.log(error)
                //         next(error)
                // }
            } else {
    
                let currentPortion = req.body.currentPortion
                    
                let currentPage = 0
                let rows = 4
                const allUsersData = await User.find()
    
                const pages = Math.ceil(allUsersData.length / rows)
                // console.log(`pages: ${pages}`)
    
                //portionSize - count pagination button on 1 page
                let portionSize = 5
                //portions - count all pagination button
                // const portions = Math.ceil(pages / portionSize)
    
                
                let start = (currentPortion - 1) * portionSize * rows
                // console.log(`start: ${start}`)
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
                        endDay: usersData[i].endDay,
                        id: usersData[i]._id
                    }
                    users.push(user)
                }
                console.log(users)
    
                const paginationData = {users}
                return res.json({paginationData})
                // return res.render('service/users', {nicname1: 'vladim1', pagenumber3: 3})
            } 
    
        }catch (error) {
            console.log(error)
        }
    }
    
    // async getEmailPaymentsData(req, res, next){
    //     const email = req.query.email
    //     console.log(email)
    // }

    async getTokenPaymentsData(req, res, next){
        console.log('getTokenPaymentsData')
        const oneid = req.query.id
        console.log(`oneid: ${oneid}`)
        try {

        let token = req.cookies.token
            if(token){
                const user = await getUserfromToken(token)
                if(req.query.id && user && user.status === 'admin'){
                    const oneuser = await User.findById({_id: oneid})
                    const userPaymentsData = new PaymentsDto(oneuser)
                    return res.json({ userPaymentsData })
                }
                if (!user) {
                    return res.status(404).render('msg', {message: "User not found"})
                }
                const userPaymentsData = new PaymentsDto(user)
                return res.json({ userPaymentsData })
            } else {
                const {refreshToken} = req.cookies
                if(!refreshToken){
                    return res.status(403).render('msg', {msg: "authContr-getTokenUserData Ви не авторизувались(!token)"})
                } else {
                    const refData = await userService.refresh(refreshToken)
                    // console.log(`paymentContr-getTokenUserData-refData ${Object.values(refData)}`)
                    res.cookie('refreshToken', refData.refreshToken, {
                        maxAge: 24*30*60*60*1000,
                        httpOnly: true
                    })
                    token = refData.token
                    console.log('refData.token')
                    const user = await getUserfromToken(token)
                    if(req.query.id && user && user.status === 'admin'){
                        console.log('if')
                        const oneuser = await User.findById({_id: oneid})
                        console.log(`oneuser: ${Object.values(oneuser)}`)
                        const userPaymentsData = new PaymentsDto(oneuser)
                        return res.json({ userPaymentsData })
                    }
                    if (!user) {
                        return res.status(404).json({message: "User not found"})
                    }
                    const userPaymentsData = new PaymentsDto(user)
                    return res.json({ userPaymentsData })
                }
            }

        } catch (err) {
            console.log(`getTokenPaymentsData err: ${err}`)
            res.status(401).render('error', {message: 'Помилка встановлення ісещзії платежів'})
        }
    }
}

module.exports = new adminController()
