const mongoose = require('mongoose')
const schema = mongoose.Schema

const documentTypeSchema = new schema({
    value: String,
    label: String,
})

const documentType = mongoose.model("document_type", documentTypeSchema, "document_type")
module.exports = documentType