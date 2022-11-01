const User = require("../models/User")
const _ = require("lodash")
const jwt = require("jsonwebtoken")
const config = require("config")
const alert = require("alert")
const PaymentsDto = require('../dtos/payments-dto')


const {
    formatDate, 
    formatNowDate, 
    clg,
    emailOptionsSend,
    getNumberOfDays, 
    getUserfromToken,
    decryptToken} = require('../myFunctions/myFunctions')
const mailer = require("../nodemailer/nodemailer")
const userService = require("../services/userService")

class paymentController {
    async writePaying (req, res) {
        let token = req.cookies.token
            if(token){
                let user = await getUserfromToken(token)
                
            } else {
                const {refreshToken} = req.cookies
                    if(!refreshToken){
                        return res.status(403).json({"message": "systemContr/upload Ви не авторизувались(!token)"})
                    } else {
                        const refData = await userService.refresh(refreshToken)
                        // console.log(`paymentController/writePaying-refData: ${refData.token}`)
                        res.cookie('refreshToken', refData.refreshToken, {
                            maxAge: 24*30*60*60*1000,
                            httpOnly: true
                        })
                        token = refData.token
                        
                    }
            }
        // console.log(`paymentController/writePaying-token2: ${token}`)
        const datatoken = jwt.verify(token, config.get('JWT_ACC_ACTIVATE'))
        let userRole = datatoken.role
        // console.log(userRole)
        if(userRole !== 'admin') return res.render('msg', {msg: 'У Вас не має права доступу!'})
        let {email, sumpay} = req.body
        let user = await User.findOne({email})
            if (!user) {
                return res.status(404).json({message: "User not found"})
            }
        //==================
        let number = ++user.paymentNumber
        user.paymentNumber = number
        user.payments.push({number, date: new Date, sum: sumpay})
        //==================
        let lastPayment = user.payments[user.payments.length - 1]
        //=================================
        let daysPaying = lastPayment.sum / (100/30)
        // console.log(daysPaying)
        //=====================
        // console.log(lastPayment.date)
        // console.log(user.endDay)
        let datesDifferent = getNumberOfDays(lastPayment.date, user.endDay)
        // console.log(`datesDifferent: ${datesDifferent}`)
        // let lastPaymentDate = lastPayment.date
        let sumdays = datesDifferent + daysPaying
        let D = new Date(lastPayment.date)
        
        //paymentDateEnd:
        //datsLeftActiveServise
        if(datesDifferent > 0) {
            user.endDay = D.setDate(D.getDate() + sumdays)
            user.daysLeft = datesDifferent + daysPaying
            clg(`3 lastPayment.date: ${lastPayment.date}`)
        } else {
            user.endDay = D.setDate(D.getDate() + daysPaying)
            user.daysLeft = daysPaying
        }
        // console.log(`user.endDay: ${user.endDay}`)
        // console.log(`user.daysLeft: ${user.daysLeft}`)
    
        //========================
    
        user.sumpay = +user.sumpay + +lastPayment.sum
        // console.log(`user.sumpay: ${user.sumpay}`)
        //===========================
        user.balance = user.daysLeft * 100 / 30
        // console.log(`user.balance: ${user.balance}`)
            
        let obj1 = {
            payingDate: lastPayment.date,
            daysPaying,
        }
        user = _.extend(user, obj1)
        user.save((err, result) => {
            if(err){
                return res.status(400).render('msg', {msg: `Ошибка изменения оплати юзера ${email}`})
            } else {
                console.log(`7 lastPayment.date: ${lastPayment.date}`)
                let payingDateForPeople = formatNowDate(lastPayment.date)
                const message = {
                    to: 'ivladim95@gmail.com',
                    subject: 'Оплата послуги на CSV TO EXCEL',
                    html: `
                        <h4>${user.nicname}, Вас вітає команда CSV TO EXCEL!</h4>
                        <p>Дякуємо, що Ви обрали наш сервіс!</p>
                        <p>${payingDateForPeople} Ви оплатили ${sumpay}грн. </p>
                        <p>отримали активацію сервісу CSV TO EXCEL на ${daysPaying} днів.</p>
                        `
                }
                mailer(message)
                
                return res.status(200).render('msg', {msg: `Оплату юзера ${email} успішно змінено`})
            }
        })
    }

    async sendEndPay (req, res) {
        const users = await User.find()
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
            }
            
        }
        alert('Завершено')
        res.json({message: 'Листи о скором завершенні дії сервісу відправлено'})
    }


    async getTokenPaymentsData(req, res, next){
        console.log('getTokenPaymentsData')
        try {
        

        let token = req.cookies.token
            if(token){
                const user = await getUserfromToken(token)
                if (!user) {
                    return res.status(404).json({message: "User not found"})
                }
                console.log(`usertoken: ${user}`)
                const userPayments = new PaymentsDto(user)
                console.log(userPayments)
                
                return res.json({ userPayments })
            } 
                else {

                const {refreshToken} = req.cookies
                    if(!refreshToken){
                        return res.status(403).json({"message": "authContr-getTokenUserData Ви не авторизувались(!token)"})
                    } else {
                        console.log(`else`)
                        const refData = await userService.refresh(refreshToken)
                        console.log(`paymentContr-getTokenUserData-refData ${Object.values(refData)}`)
                        res.cookie('refreshToken', refData.refreshToken, {
                            maxAge: 24*30*60*60*1000,
                            httpOnly: true
                        })
                        token = refData.token
                        const user = await getUserfromToken(token)
                        if (!user) {
                            return res.status(404).json({message: "User not found"})
                        }
                        console.log(`user2: ${user}`)
                        const userData = new PaymentsDto(user)

                        console.log(userData)
                    
                        return res.json({ userData })
                        
                    }
            }

        } catch (err) {
            console.log(`getTokenUserRole err: ${err}`)
            res.status(401).json({message: 'Помилка встановлення ролі юзера'})
        }
    }
}

module.exports = new paymentController()


// exports.writePaying = async (req, res) => {
//     const xtext = req.cookies.xtext
//     const token = decryptToken(xtext, config.get('secretKeyForToken1'))
//     if(!token){
//         return res.status(403).json({"message": "Ви не авторизувались"})
//     }
//     const datatoken = jwt.verify(token, config.get('secretKey'))
//     let userRole = datatoken.userRole
//     if(userRole !== 'admin') return res.render('msg', {msg: 'У Вас не має права доступу!'})
//     let {email, sumpay} = req.body
//     let user = await User.findOne({email})
//         if (!user) {
//             return res.status(404).json({message: "User not found"})
//         }
//     //==================
//     let number = ++user.paymentNumber
//     user.paymentNumber = number
//     user.payments.push({number, date: new Date, sum: sumpay})
//     //==================
//     let lastPayment = user.payments[user.payments.length - 1]
//     //=================================
//     let daysPaying = lastPayment.sum / (100/30)
//     // console.log(daysPaying)
//     //=====================
//     // console.log(lastPayment.date)
//     // console.log(user.endDay)
//     let datesDifferent = getNumberOfDays(lastPayment.date, user.endDay)
//     // console.log(`datesDifferent: ${datesDifferent}`)
//     // let lastPaymentDate = lastPayment.date
//     let sumdays = datesDifferent + daysPaying
//     let D = new Date(lastPayment.date)
    
//     //paymentDateEnd:
//     //datsLeftActiveServise
//     if(datesDifferent > 0) {
//         user.endDay = D.setDate(D.getDate() + sumdays)
//         user.daysLeft = datesDifferent + daysPaying
//         clg(`3 lastPayment.date: ${lastPayment.date}`)
//     } else {
//         user.endDay = D.setDate(D.getDate() + daysPaying)
//         user.daysLeft = daysPaying
//     }
//     // console.log(`user.endDay: ${user.endDay}`)
//     // console.log(`user.daysLeft: ${user.daysLeft}`)

//     //========================

//     user.sumpay = +user.sumpay + +lastPayment.sum
//     // console.log(`user.sumpay: ${user.sumpay}`)
//     //===========================
//     user.balance = user.daysLeft * 100 / 30
//     // console.log(`user.balance: ${user.balance}`)
        
//     let obj1 = {
//         payingDate: lastPayment.date,
//         daysPaying,
//     }
//     user = _.extend(user, obj1)
//     user.save((err, result) => {
//         if(err){
//             return res.status(400).render('msg', {msg: `Ошибка изменения оплати юзера ${email}`})
//         } else {
//             console.log(`7 lastPayment.date: ${lastPayment.date}`)
//             let payingDateForPeople = formatNowDate(lastPayment.date)
//             emailOptionsSend(
//                 'ivladim95@gmail.com',
//                 'Оплата на CSV TO EXCEL.',
//                 `${user.nicname}, Вас вітає команда CSV TO EXCEL!
//                 Дякуємо, що Ви обрали наш сервіс!
//                  ${payingDateForPeople} Ви оплатили ${sumpay}грн. та отримали активацію сервісу CSV TO EXCEL 
//                  на ${daysPaying} днів.
//                  ===============================================
//                  Якщо цей лист потрапив до вас випадково, 
//                  видалить його та не звертайте уваги.
//                 `
//             )
//             // return res.status(200).json({message: `Оплату юзера ${email} змінено`})
//             return res.status(200).render('msg', {msg: `Оплату юзера ${email} успішно змінено`})
//         }
//     })
// }