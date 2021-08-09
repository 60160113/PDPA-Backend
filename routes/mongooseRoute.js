const router = require('express').Router()
const mongooseController = require('../controllers/mongooseController')

// GET //
router.get('/:model', mongooseController.find)
router.get('/:model/:id', mongooseController.find)

// POST //
router.post('/:model', mongooseController.save)

// PUT //
router.put('/:model', mongooseController.update)
router.put('/:model/:id', mongooseController.update)

// DELETE //
router.delete('/:model', mongooseController.remove)
router.delete('/:model/:id', mongooseController.remove)

module.exports = router