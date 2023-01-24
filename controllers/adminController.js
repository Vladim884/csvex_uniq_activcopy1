const User = require("../models/User")
const _ = require("lodash")
const jwt = require("jsonwebtoken")
const config = require("config")
const moment = require("moment")
const alert = require("alert")
const PaymentsDto = require('../dtos/payments-dto')
const {check, validationResult} = require("express-validator")
const mailer = require("../nodemailer/nodemailer")

class adminController {
    
    async writePaying (req, res, next) {
        try {
            moment.locale('uk')
            let {email, sumpay} = req.body
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
            //=====================
            //Кол-во новіх оплаченных минут: 
            let minutessPaying = daysPayingLast*24*60

            //сколько минут остлось с предыдущей оплаты
            var a = moment(today);
            var b = moment(user.endDay);
            let diffMinutes = b.diff(a, 'minutes')
            if (diffMinutes < 0) diffMinutes = 0

            // сколько теперь осталось оплаченных минут sumpay???
            let sumMinutesLast = diffMinutes + minutessPaying

            //конечная дата оплаченных дней:
            const endDay = moment(today).add(sumMinutesLast, 'minutes')
            user.endDay = endDay
            
            const balance = (100/30/24/60) * sumMinutesLast

            //оплачено за все время:
            user.sumpay = +user.sumpay + +lastPayment.sum
        
            user.save((err, result) => {
                if(err){
                    return res.status(400).render('msg', {msg: `Помилка зміни оплати користувача з email: "${email}"`})
                } else {
                    let payingDateForPeople = moment(lastPayment.date).format('ll')
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
            
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    async finduserPageByIdRender (req, res, next) {
        try {
            const {id} = req.body
            return res.render('menu/cabinet', {
                inputVal: id, 
                crsjs: '/js/viewUserData/userData.js', 
                flagVal: 'id',
                lineNextName: 'Ім`я користувача: '
            })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    async finduserPageRender (req, res, next) {
        const {email} = req.body

        return res.render('menu/cabinet', {
            inputVal: email, 
            crsjs: '/js/viewUserData/userData.js', 
            flagVal: 'email',
            lineNextName: 'Ім`я користувача: '
        })
    }

    async finduser (req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Uncorrect request", errors})
            }
            
            const {usdata} = req.body
            const email = usdata
            console.log(email)
            const user = await User.findOne({email})
            if (!user) return res.status(404).render('error', {errorMsg: `юзера з email: "${email}" не знайдено`})

            res.json({user})
                
        } catch (err) {
            console.log(err)
            return res.render('error', {msg: 'err'})
        }
    }

    async finduserbyid (req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Uncorrect request", errors})
            }
            const {usdata} = req.body
            const userId = usdata
            
            const user = await User.findById({_id: userId})
            if (!user) return res.status(404).render('error', {errorMsg: `юзера з email: "${email}" не знайдено`})
            res.json({user})
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    async findUserPayments (req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Uncorrect request", errors})
            }
            const {email} = req.body
            const user = await User.findOne({email})
            if (!user) return res.status(404).render('error', {errorMsg: `юзера з email: "${email}" не знайдено`})
            
            let payments = user.payments
    
            res.json({payments})
            
        } catch (err) {
            console.log(err)
            next(err)
        }
        
    }

    async deleteUser (req, res, next) {
        try {const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).render('error', {msg: "Некоректеий запрос", er: errors})
            }
            const {email} = req.body
            const user = await User.findOne({email})
            if (!user) return res.status(404).render('error', {msg: `Користувача з email: "${email}" не знайдено`})

            await User.deleteOne({email})
            res.status(200).render('msg', {msg: `Користувача з email: "${email}" видалено`})
            
        } catch (err) {
            console.log(err)
            render('error', {msg: err})
        }
        
    }

    async sendEndPay (req, res) {
        try {
            moment.locale('uk')
            const users = await User.find()
            
            for (let i = 0; i < users.length; i++) {

                const newDat = moment().format()
                var dateB = moment(newDat)
                var dateC = moment(users[i].endDay)
                const restDay = dateC.diff(dateB, 'days')
 
                
                if (restDay < 4 && restDay > 0){
                    let nowday = moment().format('L')
                    let endDay = moment().add(restDay, 'days')
                    endDay = moment(endDay).format('L')
                    setTimeout(() => {mailer(message)}, 5000)

                    const message = {
                        to: 'ivladim95@gmail.com',
                        subject: 'Оплата послуги на CSV TO EXCEL',
                        html: `
                            <h4>Доброго дня! ${users[i].nicname}, Вас вітає команда CSV TO EXCEL!</h4>
                            <p> Дякуємо, що Ви обрали наш сервіс!</p>
                            <p>Сьогодні ${nowday} у Вас залишилось ${restDay} днів дії сервісу до ${endDay} включно.</p>
                            <p>Потурбуйтеся про своєчасну оплату сервісу!</p>
                        `
                    }
                    
                } 
                
            }
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
    
            let portionSize = 5
            
            const portions = Math.ceil(pages / portionSize)
    
            let start = (currentPortion - 1) * portionSize
            
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
            const paginationData = {users, currentPage, rows, pages, currentPortion, portionSize, start, portions}
            
            return res.json({paginationData})
        } catch (error) {
                console.log(error)
                next(error)
        }
                
    }

    async getAnyUsersList(req, res, next){
        if(!req.body) return res.sendStatus(400)
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
                    
                    const paginationData = {users}
                    return res.json({paginationData})
            } else {
    
                let currentPortion = req.body.currentPortion
                    
                let currentPage = 0
                let rows = 4
                const allUsersData = await User.find()
    
                const pages = Math.ceil(allUsersData.length / rows)
    
                let portionSize = 5
                
                let start = (currentPortion - 1) * portionSize * rows
                
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
                console.log(users)
    
                const paginationData = {users}
                return res.json({paginationData})
                // return res.render('service/users', {nicname1: 'vladim1', pagenumber3: 3})
            } 
    
        }catch (error) {
            console.log(error)
            next(error)
        }
    }
    
    
    async getUserPaymentsData(req, res, next){
        try {
            const oneid = req.body.idpay
            console.log(oneid)
            if(!oneid) return res.status(400).render('error', {msg: 'Помилка запиту!'})
            const oneuser = await User.findById({_id: oneid})
            if(!oneuser) return res.status(404).render('error', {msg: 'Користувача не знайдено!'})
            
            
            //all pagination data:
            const userPaymentsData = new PaymentsDto(oneuser)
            
            let paimentsArr = []
            for (let i = userPaymentsData.payments.length - 1; i >= 0; i--) {
                paimentsArr.push(userPaymentsData.payments[i])
            }
            
            const currentPortion = +req.body.currentPortion
            
            let currentPage = +req.body.currentPage
            
            let rows = 5
            const pages = Math.ceil(paimentsArr.length / rows)
            const nicname = userPaymentsData.nicname

            //portion - count pagination button on 1 page
            let portionSize = 5

            //portions - count all pagination button
            const portions = Math.ceil(pages / portionSize)
    
            
            let start = currentPage * rows
            
            console.log(`start: ${start}`)
            
            const end = start + rows
            
            const currPaymentsData = paimentsArr.slice(start, end)

            const paginationData = {currPaymentsData, nicname, currentPage, currentPortion, rows, pages, portionSize, start, portions}
            
            return res.json({paginationData})
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    async payHistPageForAdmRender (req, res, next) {
        try {
            return await res.render('service/adminserv/payhistory-foradmin')
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    async getForAdminPaymentsData (req, res, next){
        try {
            const oneid = req.query.id
            if(!oneid) return res.status(400).render('error', {msg: 'Помилка запиту!'})
            const oneuser = await User.findById({_id: oneid})
            if(!oneuser) return res.status(404).render('error', {msg: 'Користувача не знайдено!'})
            const userPaymentsData = new PaymentsDto(oneuser)
            return res.json({ userPaymentsData })
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}

module.exports = new adminController()
