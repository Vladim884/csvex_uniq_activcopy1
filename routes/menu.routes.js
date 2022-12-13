const Router = require("express")
const router = new Router()
const menuController = require("../controllers/menuController")
const systemController = require("../controllers/systemController")
const { cookieJwtAdminAuth } = require("../middleware/cookieJwtAdminAuth")


router.get("/main", menuController.mainPageRender)
router.get("/about", menuController.aboutPageRender)
router.get("/contacts", menuController.contactsPageRender)
router.get("/adminPanel", [cookieJwtAdminAuth.cookAuth, cookieJwtAdminAuth.adminAuth], menuController.adminPanelPageRender)
router.get("/cabinet", menuController.cabinetPageRender)
router.get("/enter", menuController.renderEnterPage)
router.get("/start", menuController.renderStartPage)
// router.get("/start", systemController.getAccessToStart)

router.get('/logout', menuController.logout)


module.exports = router