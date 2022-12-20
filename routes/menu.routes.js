const Router = require("express")
const router = new Router()
const menuController = require("../controllers/menuController")
const systemController = require("../controllers/systemController")
const { cookieJwtAdminAuth } = require("../middleware/cookieJwtAdminAuth")
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

      .get('/chats/rooms', cookieJwtAdminAuth.cookAuth,  (req, res) => {
            const name = req.query.name
            return res.render(`chats/rooms`, {rooms: name})
      })

      .get('/chats/addRoom', cookieJwtAdminAuth.cookAuth,  menuController.addRoom)
      // router.get("/start", systemController.getAccessToStart)

      .get('/logout', menuController.logout)


module.exports = router