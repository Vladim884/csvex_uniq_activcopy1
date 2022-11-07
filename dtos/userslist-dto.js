module.exports = class UserListDto{
    nicname
    registrDate
    email
    role
    balance
    endDay

    

    constructor(model){
        this.nicname = model.nicname
        this.registrDate = model.registrDate
        this.email = model.email
        this.role = model.status
        this.balance = model.balance
        this.endDay = model.endDay
    }
}