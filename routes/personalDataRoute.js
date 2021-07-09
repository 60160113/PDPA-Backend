const router = require('express').Router()
const personalDataController = require('../controllers/personalDataController')

// GET //
router.get('/', personalDataController.find)
router.get('/:id', personalDataController.find)

// POST //
router.post('/', personalDataController.save)

// PUT //
router.put('/:id', personalDataController.update)

// DELETE //
router.delete('/:id', personalDataController.remove)

module.exports = router