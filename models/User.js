const {Schema, model, ObjectId} = require("mongoose")


const User = new Schema({
    email: {
        type: String, 
        trim: true, 
        required: true, 
        unique: true,
        lowercase: true
    },
    password: {type: String, required: true},
    resetLink: {data: String, default: ''},
    diskSpace: {type: Number, default: 1024**3*10},
    usedSpace: {type: Number, default: 0},
    avatar: {type: String},
    files : [{type: ObjectId, ref:'File'}]
})

module.exports = model('User', User)
