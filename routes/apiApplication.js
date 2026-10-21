/**
 * API Application Routes — routes/apiApplication.js
 * Week 06: Direct (/api/applications) and Nested (/api/jobs/:jobId/applications & /api/users/:userId/applications)
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const ApiApplicationController = require('../controllers/ApiApplicationController');

router.get('/', ApiApplicationController.getAll);
router.post('/', ApiApplicationController.create);
router.get('/:id', ApiApplicationController.getById);
router.put('/:id', ApiApplicationController.update);
router.patch('/:id', ApiApplicationController.partialUpdate);
router.delete('/:id', ApiApplicationController.delete);

module.exports = router;
