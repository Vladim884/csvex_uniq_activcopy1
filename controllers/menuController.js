const { getUserfromToken } = require("../myFunctions/myFunctions")
const userService = require("../services/userService")

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
            return await res.render('menu/cabinet')
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
                    return res.status(403).json({"message": "systemContr/upload Ви не авторизувались(!token)"})
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
            if(daysLeft === 0) return res.render('menu/cabinet', {msg: 'У Вас не вистачає коштів.'})
            await res.render('menu/start.hbs')
        } catch (err) {
            console.log(err)
            next(err)
        }
    
    }

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