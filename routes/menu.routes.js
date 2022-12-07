const Router = require("express")
const router = new Router()



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
router.get("/adminPanel", function(req, res){
    res.render('menu/adminPanel.hbs')
})
router.get("/cabinet", function(req, res){
    res.render('menu/cabinet.hbs')
})
    


module.exports = router