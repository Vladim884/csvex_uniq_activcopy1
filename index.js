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

const { Server } = require("socket.io")
const { instrument } = require("@socket.io/admin-ui")

const permissionsPolicy = require("permissions-policy")



const PORT = config.get('serverPort')
const coocieParser = require('cookie-parser')
const corsMiddleware = require('./middleware/cors.middleware')
const { cookieJwtAdminAuth } = require("./middleware/cookieJwtAdminAuth")
//const fetch = require('node-fetch')
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

app.use(corsMiddleware)
app.use(express.json())

app.use(multer({dest : 'dest'}).single("filedata"))

app.use(express.static(__dirname + '/public'))


app.use(
    permissionsPolicy({
      features: {
        fullscreen: ["self"], // fullscreen=()
        autoplay: ["self", '"http://localhost:5000/public/sound/sound.mp3"']
      },
    })
  )

app.use("/api/auth", authRouter)
app.use("/api/files", fileRouter)
app.use("/api/system", systemRouter)
app.use("/api/admin", adminRouter)

app.use('/', menuRouter)

app.get('/adminchat', [cookieJwtAdminAuth.cookAuth], (req, res) => {
    res.sendFile(__dirname + '/adminchat.html')
})

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



const io = new Server(server)

// const io = new Server(server, {
//     cors: {
//       origin: ["https://admin.socket.io"],
//     }
// })

// instrument(io, {
// auth: {
//     type: "basic",
//     username: "admin",
//     password: require('bcrypt').hashSync('fgtfdefghk', 8) // "changeit" encrypted with bcrypt
// },
// })

const io_adminNameSpace = io.of('/admin')

io_adminNameSpace.on('connect', (socket) => {
    // console.log('new client is conectiom')
    socket.on('join', (data) => {
        //console.log(`data.room: ${data.room}`)
        socket.join(data.room)
        const userN = data.nicname
        const userId = data.userId
        const userL = `${config.get("CLIENT_URL")}/chats/rooms?name=${data.room}`

        io_adminNameSpace.in('adminchat').emit('chat message', `joined ${userN} ${data.room} ${userL} ${userId}`)
        
       socket.on('disconnect', () => {
            io_adminNameSpace.in('adminchat').emit('chat message', `disconnect ${userN} ${data.room} ${userL} ${userId}`)
        })
    })

    

    // socket.on('disconnect', (data) => {
    //     io_adminNameSpace.in('adminchat').emit('chat message', `${data.nicname} is disconnect`)
    //     console.log(`user ${data.nicname} is disconnect`)
    // })

    socket.on('chat message', (data) => {
      console.log(`${data.nicname}: ` + data.msg)
      io_adminNameSpace.in(data.room).emit('chat message', `${data.msg}`)
    })

    socket.on('send msg to all', (data) => { //to all rooms
      console.log('message: ' + data.msg)
      io_adminNameSpace.emit('chat message', `${data.nicname}: ${data.msg}`)
    })

    // socket.on('send msg to all', (data) => { //to x rooms
    //     console.log('message: ' + data.msg)
    //     io_adminNameSpace.in('executive').emit('chat message', `data.msg: ${data.msg}`)
    //   })

    // socket.on('send msg to all', (data) => {// to speciffic rooms
    //   console.log('message: ' + data.msg)
    //   io_adminNameSpace.in('executive').in('engineer').emit('chat message', `data.msg: ${data.msg}`)
    // })
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






