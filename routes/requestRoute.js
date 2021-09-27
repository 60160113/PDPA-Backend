const router = require('express').Router()
const requestController = require('../controllers/requestController')

// POST //
router.post('/publish/:id', requestController.publish)

// PUT //
router.put('/expired/:id/:folder', requestController.forceExpiration)

router.put('/expired', requestController.checkDataExpiration)

module.exports = router