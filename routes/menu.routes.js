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
            function saveChatData(userPaymentsData) {
                  const userId = userPaymentsData.id
                  const nicname = userPaymentsData.nicname
                  const linkStr = `/chats/rooms?name=${name}`
                  const createDate = moment().format()
                  console.log(`${userId} ${nicname} ${createDate} ${linkStr}`)
                  //const chatData = await chatDataModel.create({user: userId, nicname, createData})
            }
            
            return res.render(`chats/rooms`, {rooms: name, nicname: userPaymentsData.nicname})
      })

      .get('/chats/addRoom', cookieJwtAdminAuth.cookAuth,  menuController.addRoom)
      // router.get("/start", systemController.getAccessToStart)

      .get('/logout', menuController.logout)

      .post('/saveStartChatData', cookieJwtAdminAuth.cookAuth, async (req, res, next) => {
            try {
                  const {userId, nicname, linkHref} = req.body
                  const chatData = new ChatData({user:userId, nicname, linkHref})
                  //chatData.messages.push({date: moment().format(), message})
                  chatData.save()
                  // const saveData = {userId, nicname, linkHref}
                  // console.log(`linkHref: ${linkHref}`)
                  res.status(200).end()
            } catch (error) {
                  console.log(error)
                  next(error)
            }
      })
      .post('/saveChatData', cookieJwtAdminAuth.cookAuth, async (req, res, next) => {
            // const name = req.query.name
            const name = req.body.room
            console.log(`name: ${name}`)
            const message = req.body.message
            console.log(message)
            let chatData = await ChatData.findOne({'linkHref': `/chats/rooms?name=${name}`})
            chatData.messages.push({date: moment().format(), message})

            // let obj = {
            //   messages
            // }
            // chatData = _.extend(chatData, obj)
            chatData.save()
            // const foundUser = await User.findOne ({ "email" : req.body.email });
            // console.log(chatData)
            // const filter = { linkHref: `/chats/rooms?name=${name}` }
            // const update = { messages: chatData.messages.push({date: moment().format(), message}) }
            //let doc = await ChatData.updateOne({messages: chatData.messages.push({date: moment().format(), message}) })
            res.status(200).end()
            //chatData.messages.push({date: moment().format(), message})
            // chatData.save()
      })


module.exports = router