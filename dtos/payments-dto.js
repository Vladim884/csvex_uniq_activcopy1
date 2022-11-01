module.exports = class PaymentsDto{
    nicname
    payments
    
    constructor(model){
        this.nicname = model.nicname
        this.payments = model.payments
    }
}