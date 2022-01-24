const router = require('express').Router()
const notifyController = require('../controllers/notifyController')

// POST //
router.post('/line', notifyController.line)

router.post('/mail', notifyController.email)

module.exports = router