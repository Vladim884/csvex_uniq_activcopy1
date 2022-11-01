module.exports = class UserDto{
    id
    
    constructor(model){
        this.id = model._id
    }
}

