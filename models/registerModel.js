const mongoose = require('mongoose')
const schema = mongoose.Schema

const registerSchema = new schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true  
    },
    lastName: {
        type: String,
        default: ""
    }
})

const register = mongoose.model("register", registerSchema, "register")
module.exports = register