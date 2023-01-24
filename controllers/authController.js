const User = require("../models/User")
const bcrypt = require("bcryptjs")
const moment = require("moment")
const _ = require("lodash")
const jwt = require("jsonwebtoken")
const config = require("config")
const {check, validationResult} = require("express-validator")
const UserDto = require('../dtos/user-dto')
const UsercabinetDto = require('../dtos/usercabinet-dto')
const RoleDto = require('../dtos/role-dto')
const tokenService = require('../services/tokenService')
const {
        chiperToken,
        decryptToken,
        getUserfromToken} = require('../myFunctions/myFunctions')
const mailer = require("../nodemailer/nodemailer")
const userService = require("../services/userService")
const { deleterOldFile } = require("../services/fileService")
const Token = require("../models/Token")

class authController {

    async registrationPageRender(req, res, next) {
        try {
            return await res.render('auth/registration')
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    async forgpassPageRender(req, res, next) {
        try {
            return await res.render('auth/forgpass')
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    async resetpassPageRender(req, res, next) {
        try {
            return await res.render('auth/resetpass')
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    async activatePageRender(req, res, next) {
        try {
            return await res.render('auth/activate')
        } catch (err) {
            console.log(err)
            next(err)
        }
    }
    
    async signup (req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Uncorrect request", errors})
            }
            if (!req.body.flag) {
                return res.render('auth/registration', {
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
            const token1 = chiperToken(token, config.get('secretKeyForChiperToken'))
            const message = {
                to: 'ivladim95@gmail.com',
                subject: 'Вітаємо! Ви успішно зареєстровані на нашому сайті CSVtoEXCEL!',
                html: `
                    <h4>Доброго дня, ${nicname}! Кликните на ссылку для активации Вашего аккаунта</h4>
                    <p>${config.get('CLIENT_URL')}/api/auth/activate?check=${token1}</p>
                    `
            }
            mailer(message)
            return res.render('msg', {msg: `Вам надіслано лист активації на ${email}, активуйте свій акаунт.`})
        } catch(err) {
            console.log(err)
            next(err)
        }
    }
    
    async activateAccount(req, res, next) {
        try {
            let token1 = req.body.name
            let token = decryptToken(token1, config.get('secretKeyForChiperToken'))
            
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
            if(req.body.dataInMail){
            const message = {
                to: 'ivladim95@gmail.com',
                subject: 'Вітаємо! Ви успішно зареєстровані на нашому сайті CSVtoEXCEL!',
                html: `
                    <h2>Вітаємо! Ви успішно зареєстровані на нашому сайті CSVtoEXCEL!</h2>
                    <i>дані вашого облікового запису:</i>
                    <ul>
                        <li>login: ${email}</li>
                        <li>password: ${password}</li>
                    </ul>
                    ${
                    req.body.promo
                        ? `Ви підписані на розсилку наших акцій та пропозицій,
                        щоб відписатися від розсилки, перейдіть за посиланням
                    <a href="{process.env.HOST}/unsubscribe/{req.body.email}/">отписаться от рассылки</a>`
                        : ''
                    }
                    <p>Збережіть ваші данні в надійному місці та видаліть цей лист.<p>
                    <p>Цей лист не вимагає відповіді.<p>`
            }
                // console.log(req.body.promo)
                mailer(message)
            
            } else {
                const message = {
                    to: 'ivladim95@gmail.com',
                    subject: 'Вітаємо! Ви успішно зареєстровані на нашому сайті CSVtoEXCEL!',
                    html: `
                        <h2>Вітаємо! Ви успішно зареєстровані на нашому сайті CSVtoEXCEL!</h2>
                    `    
                }
                mailer(message)
            }
            return await res.render('menu/enter', {
                msg: `Активація пройшла з усвіхом! 
                        Введіть Ваші данні.`,
                        password,
                        email
            })
        } catch(err) {
            console.log(err)
            next(err)
        }
    }

    async forgotPassword (req, res, next) {
        try {
            const {email} = req.body
            const user = User.findOne({email}, (err, user) => {
                if(err || !user) {
                    return res.status(400).render('error', {msg: `користувача с email: ${email} не існує.`})
                }
            })
            const token = jwt.sign({_id: user._id, email}, config.get('RESET_PASSWORD_KEY'), {expiresIn: '20m'})
            const token1 = chiperToken(token, config.get('secretKeyForChiperToken'))
            const message = {
                to: 'ivladim95@gmail.com',
                subject: 'RESET YOUR PASSWORD',
                html: `
                    <h4>Перейдіть за посиланням для скидання пароля</h4>
                    <p>${config.get('CLIENT_URL')}/api/auth/resetpass?resetlink=${token1}</p>
                    `
            }
            mailer(message)
            
            return user.updateOne({resetLink: token}, (err, succces) => {
                if(err){
                    return res.status(400).render('error', {msg: `Помилка посилання на скидання пароля.`})
                } else {
                    return res.render('msg', {msg: `Вам відправлено посилання скидання пароля на ${email}.`})
                }
            })
            
        } catch (error) {
            console.log(errpr)
            next(error)
        }
    }

    async resetPassword (req, res) {
        const {crypt, newPass} = req.body
        // console.log(`crypt: ${crypt}`)
        let resetLink = decryptToken(crypt, config.get('secretKeyForChiperToken'))
        
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
                            return res.status(400).render('error', {msg: `Помилка скидання пароля.`})
                        } else {
                            return res.status(200).render('msg', {msg: `Пароль змінено.`})
                        }
                    })
                })
            })
            
        } else {
            return res.status(401).render('error', {msg: 'Помилка автентифікації.'})
        }
    }

    async login (req, res, next) {
        try {
            const {email, password} = req.body
            const candidate = await User.findOne({email})
            if(!candidate) {
                return res.status(400).render('msg', {
                    msg: `Користувача з email: ${email} не знайдено, спробуйте ввести інший email,
                     чи зареєструватися на сайті`})
            }
            const userData = await userService.login(email, password, req, res, next)
            let user = userData.user
            const token = userData.token
            const refreshToken = userData.refreshToken
            deleterOldFile(user)
            
            res.cookie('token', token, {
                maxAge: 5000,
                httpOnly: true
            })
            res.cookie('refreshToken', refreshToken, {
                maxAge: 300000,
                httpOnly: true
            })

            return await res.render('menu/cabinet', {
                crsjs: '/js/viewUserData/cabinetUserData.js', 
                inputIdVal: '',
                lineNextName: 'Вітаємо, '
            })    
        } catch (err){
            console.log(err)
            next(err)
        }
    }

    async reresh(req, res, next){
        try {
            const {refreshToken} = req.cookies
            const userData = await userService.refresh(refreshToken)
            
            res.cookie('refreshToken', refreshToken, {
                maxAge: 24*30*60*60*1000,
                httpOnly: true
            })
            res.json(userData)
        } catch (err) {
            console.log(err)
            next(err)
        }
            
    }

    async getTokenUserData (req, res, next) {
        try {
            let token = req.cookies.token
            if(token){
                const userData = await getUserfromToken(token)
                const user = new UsercabinetDto(userData)
                if (!user) {
                    return res.status(404).json({message: "Юзера не знайдено."})
                }
                return res.json({ user })
            } else {
                const {refreshToken} = req.cookies
                if(!refreshToken){
                    return res.status(403).json({"message": "Ви не авторизувались)"})
                } else {
                    const refData = await userService.refresh(refreshToken)
                    res.cookie('refreshToken', refData.refreshToken, {
                        maxAge: 24*30*60*60*1000,
                        httpOnly: true
                    })
                    token = refData.token
                    const userData = await getUserfromToken(token)
                
                    const user = new UsercabinetDto(userData)
                    if (!user) {
                        return res.status(404).json({message: "Юзера не знайдено."})
                    }
                    return res.json({ user })
                }
            }
        } catch (err) {
            console.log(err)
            next(err)
        }
    }
    
    async getTokenUserRole (req, res, next) {
        try {
            let token = req.cookies.token
            if(token){
                const user = await getUserfromToken(token)
                if (!user) {
                    return res.status(404).json({message: "Юзера не знайдено."})
                }
                const userRole = new RoleDto(user)
                return res.json({ userRole })
            } else {
                const {refreshToken} = req.cookies
                if(!refreshToken){
                    return res.status(403).json({"message": "Ви не авторизувались"})
                } else {
                    const refData = await userService.refresh(refreshToken)
                    res.cookie('refreshToken', refData.refreshToken, {
                        maxAge: 24*30*60*60*1000,
                        httpOnly: true
                    })
                    token = refData.token
                    const user = await getUserfromToken(token)
                    if (!user) {
                        return res.status(404).json({message: "Юзера не знайдено."})
                    }
                    const userRole = new RoleDto(user)
                    return res.json({ userRole })
                }
            }
        } catch (err) {
            console.log(err)
            next(err)
        }
    }
}

module.exports = new authController()
