const mongoose = require('mongoose')
const schema = mongoose.Schema

const personalDataSchema = new schema({
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
    data: {
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            default: ""
        }
    },
    publish: {
        isPublished: {
            type: Boolean,
            default: false
        },
        id: {
            type: String,
            default: ""
        }
    },
    consents: [],
    createdAt: { type: Date, default: Date.now },
    expiredAt: { type: Date },
    uniqueId: {
        type: String,
        unique: true,
        required: true,
        default: function() {
            return `$_%${this.requester.id}&&?${this.data.id}^@#`;
        }
    }
})

const personalData = mongoose.model("personal_data", personalDataSchema, "personal_data")
module.exports = personalData