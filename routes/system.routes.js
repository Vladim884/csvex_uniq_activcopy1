const Router = require("express")
const systemController = require("../controllers/systemController")
const router = new Router()
const {cookieJwtAuth} = require('../middleware/cookieJwtAuth')


router.get('/start', cookieJwtAuth, systemController.getAccessToStart)
router.post('/upload', [cookieJwtAuth], systemController.upload)
router.post('/upload01', [cookieJwtAuth], systemController.upload01)
router.post('/upload1', cookieJwtAuth, systemController.upload1)
router.post('/upload2', cookieJwtAuth, systemController.upload2)

module.exports = router