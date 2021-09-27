const mongoose = require('mongoose')
const schema = mongoose.Schema

const statusSchema = new schema({
    value: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ""
    },
    color: {
        type: String,
        default: "info"
    }
})

const status = mongoose.model("status", statusSchema, "status")
module.exports = status