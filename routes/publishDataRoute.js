const router = require('express').Router()
const publishDataController = require('../controllers/publishDataController')

// POST //
router.post('/:id', publishDataController.publish)

module.exports = router