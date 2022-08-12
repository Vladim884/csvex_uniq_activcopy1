const User = require("../models/User")
const bcrypt = require("bcryptjs")
const _ = require("lodash")
const jwt = require("jsonwebtoken")
const config = require("config")
const {check, validationResult} = require("express-validator")
const alert = require('alert')

const {
    formatDate, 
    formatNowDate, 
    clg,
    transporter,
    emailOptionsSend } = require('../myFunctions/myFunctions')
// const {formatNowDate} = require('../myFunctions/formatNowDate')
// const {transporter} = require('../myFunctions/transporter')
// const {emailOptionsSend} = require('../myFunctions/emailOptionsSend')

exports.signup = async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({message: "Uncorrect request", errors})
        }
        if (!req.body.flag) {
            return res.render('./message.hbs')
        }
        console.log(req.body)
        const {nicname, email, password} = req.body
        const candidate = await User.findOne({email})
        if(candidate) {
            return res.status(400).json({message: `Пользователь с email: ${email} уже существует`})
        }
        if (!req.body.flag) {
            return res.status(400).json({message: `Для регистрации неоходимо согласие с правилами и договором`})
        }
        const token = jwt.sign({nicname, email, password}, config.get('JWT_ACC_ACTIVATE'), {expiresIn: 60 * 60})
        emailOptionsSend(
            'ivladim95@gmail.com',
            'ACTIVATE YOUR ACCOUNT',
            '',
            `
            <h4>Доброго дня, ${nicname}! Кликните на ссылку для активации Вашего аккаунта</h4>
            <p>${config.get('CLIENT_URL')}/api/auth/activate?token=${token}</p>
            `
            )
            return res.json({message: `Вам отправлено письмо активации на ${email}, активируйте свой аккаунт.`})
    } catch(err) {
        console.log(err)
    }
}
    
exports.activateAccount = async (req, res) => {
    const token = req.body.name
    if (!token){
        res.json({error: 'Что-то c token не так!'})
    }
    if (token) {
        const {nicname, email, password} = jwt.verify(token, config.get('JWT_ACC_ACTIVATE'))
        console.log(email)
        console.log(password)
    try {
        const hashPassword = await bcrypt.hash(password, 8)
        const user = new User({nicname, email, password: hashPassword})
        await user.save()
        emailOptionsSend(
            'ivladim95@gmail.com', 
            'Регистрация на CSV TO EXCEL.', 
            `
             Спасибо, что Вы зарегистрировались на CSV-UNIQ!
             ===============================================
             Ваши 
             логин: ${email} 
             пароль: ${password}
             Сохраните эти данные в надёжном месте 
             и удалите это сообщение.
             `
        )
        return res.render('./start.hbs')
    } catch(err) {
        console.log(err)
        res.json({error: 'Что-то пошло не так!'})
    }
}}

exports.writePaying = (req, res) => {
    const {email, sumpay} = req.body
    const oneDayPay = 100 / 30
    const daysPaying = Math.trunc(sumpay / oneDayPay)
    const payingDate = new Date()
    const payingDayforPeople = formatNowDate()
    // console.log(`payingDayforPeople: ${payingDayforPeople}`)
    const endDay = new Date(payingDate.getTime() + (daysPaying * 24 * 60 * 60 * 1000)); 
    const endDayForPeople = formatDate(daysPaying)
    // console.log(`endDay: ${endDay}`)
    User.findOne({email}, (err, user) => {
        if(err || !user) {
            return res.status(400).json({message: `Пользователя с email: ${email} не существует`})
        }
        
    let obj1 = {
        payingDate,
        sumpay,
        daysPaying,
        endDay
    }
    user = _.extend(user, obj1)
    user.save((err, result) => {
        if(err){
            return res.status(400).json({message: `Ошибка изменения оплати юзера ${email}`})
        } else {
            emailOptionsSend(
                'ivladim95@gmail.com',
                'Оплата на CSV TO EXCEL.',
                `
                 ${payingDayforPeople} Ви оплатили ${sumpay}грн. та отримали сервіс CSV TO EXCEL 
                 на протязі ${daysPaying} днів до ${endDayForPeople} включно.
                
                 ===============================================
                 Ваши 
                 логин: ${email} 
                 Якщо цей лист потрапив до вас випадково, 
                 видалить його та не звертайте уваги.
                `
            )
            return res.status(200).json({message: `Оплату юзера ${email} змінено`})
        }
    })
    })
    
}

exports.forgotPassword = (req, res) => {
    const {email} = req.body
    const user = User.findOne({email}, (err, user) => {
        if(err || !user) {
            return res.status(400).json({message: `Пользователя с email: ${email} не существует`})
        }
    })
    const token = jwt.sign({_id: user._id, email}, config.get('RESET_PASSWORD_KEY'), {expiresIn: '20m'})
    const mailOptions = {
        from: config.get('EMAIL'), // sender address
         to: 'ivladim95@gmail.com', // list of receivers
        subject: 'RESET YOUR PASSWORD',
        html: `
            <h4>Кликните на ссылку для сброса Вашего пароля</h4>
            <p>${config.get('CLIENT_URL')}/resetpass?resetlink=${token}</p>
            `
    }
    return user.updateOne({resetLink: token}, (err, succces) => {
        if(err){
            return res.status(400).json({message: `Ошибка ссылки сброса пароля`})
        } else {
            transporter.sendMail(mailOptions, function (err, info) {
                if(err) console.log(err)
                console.log(info);
                return res.json({message: `Вам отправлена ссылка сброса пароля на ${email}.`})
            })
        }
    })
}

exports.resetPassword = (req, res) => {
    const {resetLink, newPass} = req.body
    if (resetLink) {
        jwt.verify(resetLink, config.get('RESET_PASSWORD_KEY'), (err, decodeData) => {
            if (err) {
                res.status(401).json({message: 'Некорректная или устаревшая ссылка сброса пароля'})
            }
            User.findOne({resetLink}, async (err, user) => {
                if(err || !user) {
                    return res.status(400).json({message: `Пользователя с таким токеном не существует`})
                }
                const hashPassword = await bcrypt.hash(newPass, 8)
                let obj = {
                    password: hashPassword
                }
                user = _.extend(user, obj)
                user.save((err, result) => {
                    if(err){
                        return res.status(400).json({message: `Ошибка сброса пароля`})
                    } else {
                        return res.status(200).json({message: `Пароль был изменен`})
                    }
                })
            })
        })
        
    } else {
        res.status(401).json({message: 'Ошибка аутентификации!!!'})
    }
}

exports.sendEndPay = async (req, res) => {
    const users = await User.find()
    for (let i = 0; i < users.length; i++) {
        const restDay = Math.round((users[i].endDay - new Date()) / (60 * 60 * 24 * 1000))
        clg('restDay', `${restDay}`)
        if (restDay < 9 && restDay > 0){
                let nowday = formatNowDate()
                let endDay = formatDate(restDay)
                clg('endDay', `${endDay}`)
                emailOptionsSend(
                    'ivladim95@gmail.com',
                    'Оплата на CSV TO EXCEL.',
                    `
                     Доброго дня!
                    Сьогодні ${nowday} у Вас залишилось ${restDay} днів до ${endDay} включно.
                    Потурбуйтеся про своєчасну оплату сервісу!
                     ===============================================
                     Ваши 
                     логин: ${users[i].email} 
                     Якщо цей лист потрапив до вас випадково, 
                     видалить його та не звертайте уваги.
                    `
                )
                setTimeout(() => {}, 3000);
        }
        
    }
    alert('Завершено')
    res.json({message: 'Листи о скором завершенні дії сервісу відправлено'})
}


exports.getTokenUserData = async (req, res, next) => {
    const token = req.cookies.token
    if(!token){
        return res.status(403).json({"message": "Ви не авторизувались"})
    }
    try {
        const datauser = jwt.verify(token, config.get('secretKey'))
    //    req.user = user
       console.log(`user-jwt: ${datauser.email}`)
       const email = datauser.email
        const user = await User.findOne({email})
        if (!user) {
            return res.status(404).json({message: "User not found"})
        }
        console.log(Object.values(user))
    //    console.log(`user-jwt: ${user.email}`)
    return res.json({ user })
    // return res.render('./cabinet.hbs')
    } catch (err) {
        console.log(`err: ${err}`)
        res.status(401).json({message: 'Помилка встаговлення юзера'})

    }
}

