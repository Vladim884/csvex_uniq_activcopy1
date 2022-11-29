module.exports = class PaymentsDto{
    nicname
    payments
    status
    
    constructor(model){
        this.nicname = model.nicname
        this.payments = model.payments
        this.status = model.status
    }
}