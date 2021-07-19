const router = require('express').Router()
const expiredDataController = require('../controllers/expiredDataController')

// POST //
router.post('/expired', expiredDataController.checkDataExpiration)

// PUT //
router.put('/expired/:id/published/:publishId', expiredDataController.forceExpiration)

module.exports = router