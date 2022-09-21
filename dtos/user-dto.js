module.exports = class UserDto{
    nicname
    id
    email

    constructor(model){
        this.nicname = model.nicname
        this.id = model._id
        this.email = model.email
    }
}