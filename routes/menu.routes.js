const Router = require("express")
const router = new Router()
const menuController = require("../controllers/menuController")
const systemController = require("../controllers/systemController")
const { cookieJwtAdminAuth } = require("../middleware/cookieJwtAdminAuth")

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
      .get('/chats/engenier', cookieJwtAdminAuth.cookAuth, async (req, res) => {
            return await res.render('chats/engenier')
      })
// router.get("/start", systemController.getAccessToStart)

      .get('/logout', menuController.logout)


module.exports = router