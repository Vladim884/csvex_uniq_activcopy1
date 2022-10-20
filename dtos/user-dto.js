module.exports = class UserDto{
    role
    id
    email

    constructor(model){
        this.role = model.status
        this.id = model._id
        this.email = model.email
    }
}