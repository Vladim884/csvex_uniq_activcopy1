const PaymentsDto = require("../dtos/payments-dto")
const { getUserfromToken } = require("../myFunctions/myFunctions")
const userService = require("../services/userService")
const roomList = []

class menuController {
    

    async mainPageRender(req, res, next){
        try {
            return await res.render('menu/main')
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    async aboutPageRender(req, res, next){
        try {
            return await res.render('menu/about')
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    async contactsPageRender(req, res, next){
        try {
            return await res.render('menu/contacts')
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    async adminPanelPageRender(req, res, next){
        try {
            return await res.render('menu/adminPanel')
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    async cabinetPageRender(req, res, next){
        try {
            return await res.render('menu/cabinet', {
                crsjs: '/js/viewUserData/cabinetUserData.js',
                lineNextName: 'Вітаємо, '
            })
        } catch (err) {
            console.log(err)
            next(err)
        }
    }

    async renderEnterPage (req, res, next){
        try {
            await res.render('menu/enter.hbs',{msg: ``,
            email: `vov1@gmail.com`,
            password: `1111`})
        } catch (err) {
            console.log(err)
            next(err)
        }
    
    }
    async renderStartPage (req, res, next){
        try {
            let token = req.cookies.token
            let refreshToken = req.cookies.refreshToken
            let user
        
            if(token){
                user = await getUserfromToken(token)
            } else {
                if(!refreshToken){
                    return res.status(403).render("error", {msg: "Ви не авторизовані"})
                } else {
                    const refData = await userService.refresh(refreshToken)
                    res.cookie('refreshToken', refData.refreshToken, {
                        maxAge: 24*30*60*60*1000,
                        httpOnly: true
                    })
                    token = refData.token
                    user = await getUserfromToken(token)
                }
            }
            
            const daysLeft = user.daysLeft
            console.log(`daysLeft: ${daysLeft}`)
            if(daysLeft === 0) return res.render('menu/cabinet', {
                msg: 'У Вас не вистачає коштів.', 
                crsjs: '/js/viewUserData/cabinetUserData.js',
                lineNextName: 'Вітаємо, '
            })
            await res.render('menu/start.hbs')
        } catch (err) {
            console.log(err)
            next(err)
        }
    
    }

    async renderChatPage (req, res, next) {
        try {
            let user
            let token = req.cookies.token
            if(token){
                  user = await getUserfromToken(token)
                  if (!user) {
                        return res.status(404).render('msg', {message: "User not found"})
                  }
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
                        user = await getUserfromToken(token)
                    
                        if (!user) {
                              return res.status(404).json({message: "User not found"})
                        }
                  }
            }
            const userPaymentsData = new PaymentsDto(user)
            const userId = userPaymentsData.id
            const nicname = userPaymentsData.nicname
            console.log(`roomList: ${JSON.stringify(roomList)}`)
            return res.render('menu/chat', {userId, nicname})
            // return res.render('menu/chat', {rooms: roomList, userId, nicname})
            // return await res.render('menu/chat')
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

//     addRoom(req, res) {
//         const name = req.query.name
//         roomList.push(name)
//         console.log(`roomList: ${JSON.stringify(roomList)}`)
//         res.status(200)
//         // return res.render(`chats/rooms`, {rooms: name})
//   }

    async logout (req, res, next) {
        try {
            const {refreshToken} = req.cookies
            // console.log(`authContr-logout-req.coocies.refreshToken: ${refreshToken}`)
            const userData = await userService.logout(refreshToken)
            // console.log(`auuthContr-logout-token: ${userData}`)
            // deleterOldFile(user)
            // await userService.logout(refreshToken)
            // await Token.deleteOne({refreshToken})
            // await Token.deleteOne({user: '630e574ccba3eb09782eee65'})
            res 
                // .clearCookie("xtext")
                .clearCookie("token")
                .clearCookie("refreshToken")
            return res
                        .status(302)
                        .redirect('/enter')
                        //   .json({ message: "Successfully logged out 😏 🍀" })
        
        } catch (err) {
            console.log(err)
            next(err)
        }
    }
}



module.exports = new menuController()