const Router = require("express")
const router = new Router()
// const paymentController = require("../controllers/paymentController")
// const { cookieJwtAuth } = require("../middleware/cookieJwtAuth")

router.get("/main", function(req, res){
    res.render('menu/main.hbs')
})
router.get("/about", function(req, res){
    res.render('menu/about.hbs')
})

router.get('/contacts',  function(req, res){
    res.render("menu/contacts", {
        title: "Мои контакты",
        email: "gavgav@mycorp.com",
        phone: "+1234567890"
    })
})
router.get("/cabinet", function(req, res){
    res.render('./menu/cabinet.hbs')
})
    


module.exports = router