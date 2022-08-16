const {Schema, model, ObjectId} = require("mongoose")

const Payment = new Schema({
    number: {type: Number, default: 0},
    date: {type: Date, default: new Date('01/01/2001').getTime() + 3*60*60*1000}, 
    sum: {type: Number}
})

module.exports = model('Payment', Payment)


