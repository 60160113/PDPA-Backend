const mongoose = require('mongoose')
const schema = mongoose.Schema

const requestDataSchema = new schema({
    requester: {
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            default: ""
        }
    },
    documents: [],
    folder: {
        type: String,
        default: ""
    },
    label: {
        type: String,
        default: ""
    },
    createdAt: { type: Date, default: Date.now },
    expiredAt: { type: Date, default: undefined },
    status: {
        type: String,
        default: "pending"
    },
})

const requestData = mongoose.model("request_data", requestDataSchema, "request_data")
module.exports = requestData