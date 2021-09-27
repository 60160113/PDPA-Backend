const mongoose = require('mongoose')
const schema = mongoose.Schema

const requestSchema = new schema({
    type: {
        type: String,
        default: "regular" // regular: request to admin to get exist files, specific: request/assign someone to send the requested files 
    },

    // common
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
    folder: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        default: ""
    },
    createdAt: { type: Date, default: Date.now },
    expiredAt: { type: Date, default: undefined },
    status: {
        type: String,
        default: "pending"
    },

    // regular
    documents: [],
    /*
        documents: 
        {
            id: fileId,
            name: fileName,
            type: <DocumentType>
            parent: {
                name, id, group
            }
        }
    */

    // specific
    assignTo: [], 
    /*
        assignTo: 
        {
            id: userId,
            displayName: ...,
            // firstName: ...,
            // lastName: ...,
            // email: userEmail,
            isAccept: (boolean),
            comment: (String)
        }
    */

    deadline: Date
})

requestSchema.pre('save', function(next) {
    if(this.type == "regular") {
        this.assignTo = undefined
    }else {
        this.documents = undefined
    }
    next();
});

const request = mongoose.model("request", requestSchema, "request")
module.exports = request