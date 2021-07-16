const router = require('express').Router()
const expiredDataController = require('../controllers/expiredDataController')

// POST //
router.post('/expired', expiredDataController.checkDataExpiration)

router.post('/expired/:id', expiredDataController.forceExpiration)

module.exports = router