// const { getUserfromToken } = require("../myFunctions/myFunctions")

// exports.getUserRole = async (req, res) => {
//     const token = req.cookies.token
//         if(!token){
//             return res.status(403).json({"message": "Ви не авторизувались(!token)"})
//         }
//         let user = await getUserfromToken(token)
//         let userRole = String(user.status)
//         // console.log(userRole)
//         // console.log(typeof userRole)
//         if (userRole !== 'admin') {
//             // res.status(404)
//             return res.render('msg', {msg: 'У Вас не має прав доступу!'})
//         }

        // return userRole
} 