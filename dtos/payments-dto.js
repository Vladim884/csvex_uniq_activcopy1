module.exports = class PaymentsDto{
    nicname
    payments
    status
    id
    
    constructor(model){
        this.nicname = model.nicname
        this.payments = model.payments
        this.status = model.status
        this.id = model._id
    }
}