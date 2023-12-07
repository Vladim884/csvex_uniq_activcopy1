const Router = require("express")
const router = new Router()
const menuController = require("../controllers/menuController")
const systemController = require("../controllers/systemController")
const PaymentsDto = require("../dtos/payments-dto")
const { cookieJwtAdminAuth } = require("../middleware/cookieJwtAdminAuth")
const { getUserfromToken } = require("../myFunctions/myFunctions")
const userService = require("../services/userService")
const moment = require("moment")
const ChatData = require("../models/chatData/ChatData")
const _ = require("lodash")
const uuid = require("uuid");

// const roomList = []
router
      .get("/", (req, res) => {
            res.send("Express on Vercel");
          })
      .get("/main", menuController.mainPageRender)
      .get("/about", menuController.aboutPageRender)
      .get("/contacts", menuController.contactsPageRender)
      .get("/adminPanel", [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], menuController.adminPanelPageRender)
      .get("/cabinet", cookieJwtAdminAuth.cookAuth, menuController.cabinetPageRender)
      .get("/enter", menuController.renderEnterPage)
      .get("/start", menuController.renderStartPage)


      .get('/chat', cookieJwtAdminAuth.cookAuth, menuController.renderChatPage)
      // .get('/chats/executive', cookieJwtAdminAuth.cookAuth, async (req, res) => {
      //       return await res.render('chats/executive')
      // })
      .get('/chats/adminchat', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], async (req, res) => {
            // return await res.status(200).render('chats/adminchat')
            return await res.status(200).render('/adminchat')
      })
      // .get('/chats/adminchat', [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], async (req, res) => {
      //       // return await res.status(200).render('chats/adminchat')
      //       return await res.status(200).render('/adminchat.html')
      // })

      .get('/chats/rooms', cookieJwtAdminAuth.cookAuth,  async (req, res) => {
      // .get('/chats/rooms', cookieJwtAdminAuth.cookAuth,  async (req, res) => {
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
            function saveChatData(userPaymentsData) {
                  const userId = userPaymentsData.id
                  const nicname = userPaymentsData.nicname
                  const linkStr = `/chats/rooms?name=${name}`
                  const createDate = moment().format()
                  console.log(`${userId} ${nicname} ${createDate} ${linkStr}`)
                  //const chatData = await chatDataModel.create({user: userId, nicname, createData})
            }
            
            return res.status(200).render(`chats/rooms`, {rooms: name, nicname: userPaymentsData.nicname, userId: userPaymentsData.id})
            // return res.status(200).render(`__dirname/usercat.html`, {rooms: name, nicname: userPaymentsData.nicname})
      })

      //.get('/chats/addRoom', cookieJwtAdminAuth.cookAuth,  menuController.addRoom)
      // router.get("/start", systemController.getAccessToStart)

      .get('/logout', menuController.logout)

      // Save start-chat-data on db
      // .post('/saveStartChatData', cookieJwtAdminAuth.cookAuth, async (req, res, next) => {
      //       try {
      //             const {userId, nicname, linkHref} = req.body
      //             const chatData = new ChatData({user:userId, nicname, linkHref})
      //             chatData.save()
      //             res.status(200).end()
      //       } catch (error) {
      //             console.log(error)
      //             next(error)
      //       }
      // })
      // Save chat-data on db
      // .post('/saveChatData', cookieJwtAdminAuth.cookAuth, async (req, res, next) => {
      //       const name = req.body.room
      //       console.log(`name: ${name}`)
      //       const message = req.body.message
      //       console.log(message)
      //       let chatData = await ChatData.findOne({'linkHref': `/chats/rooms?name=${name}`})
      //       chatData.messages.push({date: moment().format(), message})
      //       chatData.save()
      //       res.status(200).end()
      // })


module.exports = router