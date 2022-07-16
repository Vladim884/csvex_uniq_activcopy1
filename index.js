const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
// const {cookieJwtAuth} = require('./middleware/cookieJwtAuth')
const multer  = require("multer")

const hbs = require("hbs")
const expressHbs = require("express-handlebars")
// const { engine } = require('express-handlebars')
const config = require("config")
// const fileUpload = require("express-fileupload")
const authRouter = require("./routes/auth.routes")
const fileRouter = require("./routes/file.routes")
const app = express()
// app.use(express.static(__dirname))
const PORT = config.get('serverPort')
const coocieParser = require('cookie-parser')
const corsMiddleware = require('./middleware/cors.middleware')

// let dirpath = '/'
// app.use(multer({dest : 'files/' + `${fileEndDir}`}).single("filedata"))
app.engine("hbs", expressHbs.engine(
    {
        layoutsDir: "views/layouts", 
        defaultLayout: "layout",
        extname: "hbs"
    }
))
// app.engine('handlebars', engine(
//     { 
//         layoutsDir: "views/layouts", 
//         extname: '.hbs', 
//         defaultLayout: "layout"
//     }
// ));
// app.set('view engine', 'handlebars');
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");


// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(coocieParser());

// app.use(fileUpload({}))
app.use(corsMiddleware)
app.use(express.json())
let req

app.use(multer({dest : 'dest'}).single("filedata"))

app.use(express.static(__dirname + '/public'));
app.use("/api/auth", authRouter)
app.use("/api/files", fileRouter)

app.use("/contacts", function(_, res){
    res.render("contacts", {
        title: "Мои контакты",
        email: "gavgav@mycorp.com",
        phone: "+1234567890"
    });
})

app.use("/api/auth/activate", function(req, res){
    res.render('activate.hbs')
})
app.use("/registration", function(req, res){
    res.render('registration.hbs')
})
app.use("/enter", function(req, res){
    res.render('enter.hbs')
})

app.use("/start", function(req, res){
    res.render('start.hbs')
})

app.use("/forgpass", function(req, res){
    res.render('forgpass.hbs')
})

app.use("/resetpass", function(req, res){
    res.render('resetpass.hbs')
})

app.use("/", function(req, res){
    res.render('index.hbs')
})

const start = async () => {
    // console.log(__dirname)
    try {
        await mongoose.connect(config.get("dbUrl"), {
            useNewUrlParser:true,
            useUnifiedTopology:true,
            useCreateIndex: true
        })

        app.listen(PORT, () => {
            console.log('Server started on port ', PORT)
        })
    } catch (e) {
        console.log(e)
    }
}

start()
