const User = require("../models/User")
const bcrypt = require("bcryptjs")
const moment = require("moment")
const _ = require("lodash")
const jwt = require("jsonwebtoken")
const config = require("config")
const {check, validationResult} = require("express-validator")
const alert = require('alert')
const UserDto = require('../dtos/user-dto')
const tokenService = require('../services/tokenService')
const {
        chiperToken,
        decryptToken,
        getNumberOfDays } = require('../myFunctions/myFunctions')
const { filePathDeleter } = require("../myFunctions/filePathDeleter")
const mailer = require("../nodemailer/nodemailer")
const userService = require("../services/userService")

class authController {
    async signup (req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Uncorrect request", errors})
            }
            if (!req.body.flag) {
                return res.render('registration', {
                    msg: `Щоб  зареєструватися на сайті 
                          треба подтвердження Вашеої згоди 
                          з умовами вмкористання сайту та 
                          договором офертои`
                        }
                )
            }
            
            const {nicname, email, password} = req.body
            const candidate = await User.findOne({email})
            if(candidate) {
                return res.status(400).render('msg', {msg: `Користувач з email: ${email} вже існує`})
            }
            const token = jwt.sign({nicname, email, password}, config.get('JWT_ACC_ACTIVATE'), {expiresIn: '15m'})
            const token1 = chiperToken(token, config.get('secretKeyForToken1'))
            const message = {
                to: 'ivladim95@gmail.com',
                subject: 'Congratulations! You are successfully registred on our site',
                html: `
                    
                    <h4>Доброго дня, ${nicname}! Кликните на ссылку для активации Вашего аккаунта</h4>
                    <p>${config.get('CLIENT_URL')}/api/auth/activate?check=${token1}</p>
                    `
            }
            mailer(message)
            return res.render('msg', {msg: `Вам надіслано лист активації на ${email}, активуйте свій акаунт.`})
        } catch(err) {
            // console.log(err)
            next(err)
        }
    }
    async activateAccount(req, res, next) {
        try {
            let token1 = req.body.name
            let token = decryptToken(token1, config.get('secretKeyForToken1'))
            
            if (!token){
                res.render('error', {errorMsg: 'Помилка активації токену'})
            }
            const {nicname, email, password} = jwt.verify(token, config.get('JWT_ACC_ACTIVATE'))
            
            const hashPassword = await bcrypt.hash(password, 8)
            const user = new User({nicname, email, password: hashPassword})
            const refreshToken = jwt.sign({nicname, email, password}, config.get('JWT_REF_ACTIVATE'), {expiresIn: '30d'})
            const userDto = new UserDto(user)
            await tokenService.saveToken(userDto.id, refreshToken, {maxAge: 30*24*60*60*1000, httpOnly: true})
            res.cookie('refreshToken', refreshToken)
            await user.save()
            console.log('user.save()')
            if(req.body.dataInMail){
            const message = {
                    to: 'ivladim95@gmail.com',
                    subject: 'Congratulations! You are successfully registred on our site',
                    html: `
                        <h2>Поздравляем, Вы успешно зарегистрировались на нашем сайте!</h2>
                        
                        <i>данные вашей учетной записи:</i>
                        <ul>
                            <li>login: {email}</li>
                            <li>password: {password}</li>
                        </ul>
                        ${
                        req.body.promo
                            ? `Вы подписаны на рассылку наших акций и предложений,
                        чтобы отписаться от рассылки перейдите по ссылке
                        <a href="{process.env.HOST}/unsubscribe/{req.body.email}/">отписаться от рассылки</a>`
                            : ''
                        }
                        <p>Данное письмо не требует ответа.<p>`
                }
                // console.log(req.body.promo)
                mailer(message)
                // user = req.body
                return res.render('enter', {
                    msg: `Активація пройшла з усвіхом! 
                            Введіть Ваші данні.`,
                            password,
                            email
                    })
                
                } else {
                    const message = {
                        to: 'ivladim95@gmail.com',
                        subject: 'Congratulations! You are successfully registred on our site',
                        html: `
                            <h2>Поздравляем, Вы успешно зарегистрировались на нашем сайте!</h2>
                        `    
                    }
                    mailer(message)
                    return res.render('enter', {
                        msg: `Активація пройшла з усвіхом! 
                                Введіть Ваші данні.`,
                                password,
                                email
                    })
                }
        } catch(err) {
            console.log(err)
            // res.json({err: 'Что-то пошло не так!'})
            next(err)
        }
    }

    async forgotPassword (req, res, next) {
        const {email} = req.body
        const user = User.findOne({email}, (err, user) => {
            if(err || !user) {
                return res.status(400).render('error', {msg: `Пользователя с email: ${email} не существует`})
            }
        })
        const token = jwt.sign({_id: user._id, email}, config.get('RESET_PASSWORD_KEY'), {expiresIn: '20m'})
        const token1 = chiperToken(token, config.get('secretKeyForToken1'))
        const message = {
            to: 'ivladim95@gmail.com',
            subject: 'RESET YOUR PASSWORD',
            html: `
                <h4>Кликните на ссылку для сброса Вашего пароля</h4>
                <p>${config.get('CLIENT_URL')}/resetpass?resetlink=${token1}</p>
                `
        }
        mailer(message)
        
        return user.updateOne({resetLink: token}, (err, succces) => {
            if(err){
                return res.status(400).render('error', {msg: `Ошибка ссылки сброса пароля`})
            } else {
                return res.render('msg', {msg: `Вам отправлена ссылка сброса пароля на ${email}.`})
            }
        })
    }

    async resetPassword (req, res) {
        const {crypt, newPass} = req.body
        console.log(`crypt: ${crypt}`)
        let resetLink = decryptToken(crypt, config.get('secretKeyForToken1'))
        
        if (resetLink) {
            jwt.verify(resetLink, config.get('RESET_PASSWORD_KEY'), (err, decodeData) => {
                if (err) {
                    res.status(401).render('error', {msg: 'Некорректная или устаревшая ссылка сброса пароля'})
                }
                User.findOne({resetLink}, async (err, user) => {
                    if(err || !user) {
                        return res.status(400).render('msg', {msg: `Ошибка! Пользователя с таким email не существует`})
                    }
                    const hashPassword = await bcrypt.hash(newPass, 8)
                    let obj = {
                        password: hashPassword
                    }
                    user = _.extend(user, obj)
                    user.save((err, result) => {
                        if(err){
                            return res.status(400).render('error', {msg: `Ошибка сброса пароля`})
                        } else {
                            return res.status(200).render('msg', {msg: `Пароль был изменен`})
                        }
                    })
                })
            })
            
        } else {
            return res.status(401).render('error', {msg: 'Ошибка аутентификации!!!'})
        }
    }

    async login (req, res, next) {
        try {
            const {email, password} = req.body
            // let user
            // let user = await User.findOne({email})
            // if (!user) {
            //     return res.status(404).json({message: "User not found"})
            // }
            // const isPassValid = bcrypt.compareSync(password, user.password)
            // if (!isPassValid) {
            //     return res.status(400).json({message: "Invalid password"})
            // }
            // const token = jwt.sign({id: user.id, email: user.email, userRole: user.status}, config.get("secretKey"), {expiresIn: "1h"})
            // const refreshToken = jwt.sign({id: user.id, email: user.email}, config.get("JWT_REF_ACTIVATE"), {expiresIn: "30d"})

            const userData = await userService.login(email, password)
            const user = userData.user
            const token = userData.token
            const refreshToken = userData.refreshToken


            let dirpath = `${config.get('filePath')}\\${user.id}`
            if(user.temp[0]){
                let randFilePath = user.temp[0].randFilePath
                let csvpath = user.temp[0].csvpath
                let exelpath = user.temp[0].exelpath
                filePathDeleter(csvpath)
                filePathDeleter(exelpath)
                filePathDeleter(randFilePath)
            }
            res.cookie('token', token, {
                httpOnly: true
            })
            const xtext = chiperToken(token, config.get('secretKeyForToken1')).toString()
            console.log(`xtext: ${xtext}`)
            res.cookie('xtext', xtext, {
                httpOnly: true
            })
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true
            })
            // if(user.status === 'admin'){
            //     res.cookie('admin', 'admin')
            // }
            // if(user.status === 'user'){
            //     res.cookie('user', 'user')
            // }
            let daysLeft = getNumberOfDays(new Date(), new Date(user.endDay))
            if(daysLeft < 0) daysLeft = 0
            let balance = daysLeft * 100 / 30
            if(balance < 0) balance = 0
            if (daysLeft !== user.daysLeft || balance !== user.balance) {
                let obj = {
                    daysLeft,
                    balance
                }
                user = _.extend(user, obj)
                user.save((err, result) => {
                    if(err){
                        return res.status(400).json({message: `Ошибка изменения оплати юзера ${email}`})
                    } else {
                        console.log('Баланс та залишок днів при логіні змінено???')
                    }})
            } else {
                console.log('Data has not changed')
            }
            
            return res.render('./cabinet1.hbs', {
                nicname: user.nicname,
                email: user.email,
                registrDate: moment(user.registrDate).format('DD.MM.YYYY'),
                role: user.status,
                // tegService: `Активовано на ${user.finData[0].daysLeft} дні`,
                tegService: '${user.finData[0].daysLeft} дні',
                // balance: user.finData[0].balance,
                balance: 'user.finData[0].balance',
                // lastPaymentCab: lastPaymentCab,
                lastPaymentCab: 'lastPaymentCab',
                linkHistory: 'Перейти',
                linkPay: 'Сплатити'
            }) 
            
        } catch (e){
            console.log(`/login e: ${e}`)
            next(e)
        }
    }

    async logout (req, res, next) {
        try {
            res 
            .clearCookie("xtext")
            .clearCookie("token")
            .clearCookie("user")
            .clearCookie("admin")
            return res
            .status(302)
            .redirect('/enter')
            //   .json({ message: "Successfully logged out 😏 🍀" })
        
        } catch (err) {
            next(err)
        }
    }

    async getTokenUserData (req, res, next) {
        try {
            console.log('start getTokenUserData')
        const xtext = req.cookies.xtext
        const token = decryptToken(xtext, config.get('secretKeyForToken1'))
        console.log(token)
        if(!token){
            return res.status(403).json({"message": "Ви не авторизувались"})
        }
        
            const datauser = jwt.verify(token, config.get('JWT_ACC_ACTIVATE'))
        //    req.user = user
           console.log(`user-jwt: ${datauser.email}`)
           const email = datauser.email
            const user = await User.findOne({email})
            if (!user) {
                return res.status(404).json({message: "User not found"})
            }
            // console.log(Object.values(user))
        //    console.log(`user-jwt: ${user.email}`)
        return res.json({ user })
        // return res.render('./cabinet.hbs')
        } catch (err) {
            console.log(`getTokenUserData err: ${err}`)
            res.status(401).json({message: 'Помилка встановлення юзера'})
        }
    }
}

module.exports = new authController()
