const express = require('express');
var cors = require('cors')
const app = express()
const morgan = require('morgan')

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('Hello World')
})

const PORT = 4200

app.listen(PORT, () => {
    console.log('Start server at port ' + PORT)
})