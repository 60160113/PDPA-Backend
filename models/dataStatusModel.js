const mongoose = require('mongoose')
const schema = mongoose.Schema

const dataStatusSchema = new schema({
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

const dataStatus = mongoose.model("data_status", dataStatusSchema, "data_status")
module.exports = dataStatus