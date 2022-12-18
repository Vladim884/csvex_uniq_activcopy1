const express = require("express")
const app = express()
const http = require('http')
const server = http.createServer(app)

const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const multer  = require("multer")

const hbs = require("hbs")
const expressHbs = require("express-handlebars")
// const { engine } = require('express-handlebars')
const config = require("config")
// const fileUpload = require("express-fileupload")
const authRouter = require("./routes/auth.routes")
const fileRouter = require("./routes/file.routes")
const systemRouter = require("./routes/system.routes")
const adminRouter = require("./routes/admin.routes")
const menuRouter = require("./routes/menu.routes")






const PORT = config.get('serverPort')
const coocieParser = require('cookie-parser')
const corsMiddleware = require('./middleware/cors.middleware')
const fetch = require('node-fetch')
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
// app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(coocieParser());

// app.use(fileUpload({}))
app.use(corsMiddleware)
app.use(express.json())
// let req

app.use(multer({dest : 'dest'}).single("filedata"))

app.use(express.static(__dirname + '/public'))
app.use("/api/auth", authRouter)
app.use("/api/files", fileRouter)
app.use("/api/system", systemRouter)
app.use("/api/admin", adminRouter)

app.use('/', menuRouter)

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(502)
    if(Object.values(err)[1] === 'jwt expired'){
        res.render('error', {msg: `Ви не авторизовані`, er: ''})
    }

    res.render('error', {msg: `Server Error`, er: ''});
});


app.use((req, res) => {
    res.status(404);
    res.render('error', {msg: 'Not Found'})
})

const { Server } = require("socket.io")
const io = new Server(server)

const io_adminNameSpace = io.of('/admin')

io_adminNameSpace.on('connect', (socket) => {
    // console.log('new client is conectiom')

    socket.on('join', (data) => {
        // console.log(`${data.room}`)
        socket.join(data.room)
        io_adminNameSpace.in(data.room).emit('chat message', `New Person joined ${data.room} room`)
    })

    socket.on('disconnect', (data) => {
        io_adminNameSpace.in(data.room).emit('chat message', 'user is disconnect')
        console.log('user is disconnect')

    })

    socket.on('chat message', (data) => {
      console.log('message: ' + data.msg)
      io_adminNameSpace.in(data.room).emit('chat message', `data.msg: ${data.msg}`)
    })
  })




const start = async () => {
    try {
        await mongoose.connect(config.get("dbUrl"), {
            useNewUrlParser:true,
            useUnifiedTopology:true,
            useCreateIndex: true
        })

        server.listen(PORT, () => {
            console.log('Server started on port ', PORT)
        })
        // app.listen(PORT, () => {
        //     console.log('Server started on port ', PORT)
        // })

        
    } catch (e) {
        console.log(e)
    }
}

start()






