const mongoose = require('mongoose')
const schema = mongoose.Schema

const documentSchema = new schema({
    value: String,
    label: String,
})

const document = mongoose.model("document", documentSchema, "document")
module.exports = document