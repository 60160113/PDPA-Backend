const express = require('express');
var cors = require('cors')
const app = express()
const cds = require('./cds.json')
const morgan = require('morgan')
const createError = require('http-errors')

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.get('/cds', (req, res) => {
    res.json(cds)
})

app.get('/cds/:index', (req, res) => {
    res.json(cds[req.params.index - 1])
})

app.use(async (req, res, next) => {
    next(createError.NotFound())
})

app.listen(4200, () => {
    console.log('Start server at port 4200.')
})