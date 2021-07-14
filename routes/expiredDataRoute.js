const router = require('express').Router()
const expiredDataController = require('../controllers/expiredDataController')

// POST //
router.post('/expired', expiredDataController.checkDataExpiration)

module.exports = router