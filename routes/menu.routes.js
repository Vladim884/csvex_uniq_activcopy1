const Router = require("express")
const router = new Router()
const menuController = require("../controllers/menuController")
const systemController = require("../controllers/systemController")
const PaymentsDto = require("../dtos/payments-dto")
const { cookieJwtAdminAuth } = require("../middleware/cookieJwtAdminAuth")
const { getUserfromToken } = require("../myFunctions/myFunctions")
const userService = require("../services/userService")
const moment = require("moment")
// const roomList = []
router
      .get("/main", menuController.mainPageRender)
      .get("/about", menuController.aboutPageRender)
      .get("/contacts", menuController.contactsPageRender)
      .get("/adminPanel", [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], menuController.adminPanelPageRender)
      .get("/cabinet", cookieJwtAdminAuth.cookAuth, menuController.cabinetPageRender)
      .get("/enter", menuController.renderEnterPage)
      .get("/start", menuController.renderStartPage)


      .get('/chat', cookieJwtAdminAuth.cookAuth, menuController.renderChatPage)
      // (req, res, next) => {
      //       try {
      //           return res.render('menu/chat', {rooms: roomList})
      //           // return await res.render('menu/chat')
      //       } catch (error) {
      //           console.log(error)
      //           next(error)
      //       }
      //   }
      //   )
      .get('/chats/executive', cookieJwtAdminAuth.cookAuth, async (req, res) => {
            return await res.render('chats/executive')
      })
      .get('/chats/engineer', cookieJwtAdminAuth.cookAuth, async (req, res) => {
            return await res.render('chats/engineer')
      })

      .get('/chats/rooms', cookieJwtAdminAuth.cookAuth,  async (req, res) => {
            const name = req.query.name
            //========
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
            // console.log(`Object.values()`)
            const userId = userPaymentsData.id
            const nicname = userPaymentsData.nicname
            const createData = moment().format()
            console.log(`${userId} ${nicname} ${createData}`)
            // const chatData = await chatDataModel.create({user: userId, nicname, createData})


            //--------
            return res.render(`chats/rooms`, {rooms: name, nicname})
      })

      .get('/chats/addRoom', cookieJwtAdminAuth.cookAuth,  menuController.addRoom)
      // router.get("/start", systemController.getAccessToStart)

      .get('/logout', menuController.logout)


module.exports = router