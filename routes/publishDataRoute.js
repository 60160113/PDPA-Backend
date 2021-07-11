const router = require('express').Router()
const publishDataController = require('../controllers/publishDataController')

// POST //
router.post('/', publishDataController.publish)

module.exports = router