/**
 * Web Application Routes — routes/application.js
 * Week 06
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const ApplicationController = require('../controllers/ApplicationController');

router.get('/', ApplicationController.getAll);
router.post('/', ApplicationController.create);
router.get('/:id', ApplicationController.getById);
router.post('/:id/edit', ApplicationController.update);
router.post('/:id/delete', ApplicationController.delete);

module.exports = router;
