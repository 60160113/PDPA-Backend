const router = require('express').Router()
const requestDataController = require('../controllers/requestDataController')

// POST //
router.post('/publish/:id', requestDataController.publish)

// PUT //
router.put('/expired/:id/:folder', requestDataController.forceExpiration)

router.put('/expired', requestDataController.checkDataExpiration)

module.exports = router