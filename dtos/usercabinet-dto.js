module.exports = class UsercabinetDto{
    nicname
    email
    id
    status
    balance
    daysLeft
    registrDate
    endDay
    lastPayment
    payments

    constructor(model){
        this.id = model._id
        this.nicname = model.nicname
        this.email = model.email
        this.status = model.status
        this.registrDate = model.registrDate
        this.balance = model.balance 
        this.daysLeft = model.daysLeft 
        this.endDay = model.endDay 
        this.lastPayment = model.payments[model.payments.length - 1] 
        this.payments = model.payments
    }
}

