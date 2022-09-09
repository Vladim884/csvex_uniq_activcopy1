const Router = require("express")
const systemController = require("../controllers/systemController")
const router = new Router()
const {cookieJwtAuth} = require('../middleware/cookieJwtAuth')


router.get('/start', cookieJwtAuth, systemController.getAccessToStart)
module.exports = router