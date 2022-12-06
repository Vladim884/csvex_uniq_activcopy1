const Router = require("express")
const router = new Router()
// const paymentController = require("../controllers/paymentController")
// const { cookieJwtAuth } = require("../middleware/cookieJwtAuth")



router.get('/contacts',  function(req, res){
    res.render("contacts", {
        title: "Мои контакты",
        email: "gavgav@mycorp.com",
        phone: "+1234567890"
    })
})
router.get("/cabinet", function(req, res){
    res.render('./service/cabinet.hbs')
})
    


module.exports = router