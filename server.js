const express = require('express');
var cors = require('cors')
const app = express()
const morgan = require('morgan')

require('dotenv').config()
require('./config/mongoose')

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/personal_data', require('./routes/personalDataRoute'))

app.get('/', (req, res) => {
    res.send('Hello World')
})

const PORT = process.env.PORT || 4200

app.listen(PORT, () => {
    console.log('Start server at port ' + PORT)
})