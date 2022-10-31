module.exports = class UserDto{
    id

    constructor(model){
        this.id = model._id
    }
}

// module.exports = class UserDto{
//     role
//     id
//     email

//     constructor(model){
//         this.role = model.status
//         this.id = model._id
//         this.email = model.email
//     }
// }