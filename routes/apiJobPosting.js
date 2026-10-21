/**
 * API Job Posting Routes — routes/apiJobPosting.js
 * Week 06: Direct (/api/jobs) and Nested (/api/users/:userId/jobs & /api/jobs/:jobId/applications)
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const ApiJobPostingController = require('../controllers/ApiJobPostingController');
const apiApplicationRouter = require('./apiApplication');

router.get('/', ApiJobPostingController.getAll);
router.post('/', ApiJobPostingController.create);
router.get('/:id', ApiJobPostingController.getById);
router.put('/:id', ApiJobPostingController.update);
router.patch('/:id', ApiJobPostingController.partialUpdate);
router.delete('/:id', ApiJobPostingController.delete);

// Nested applications under a job posting: /api/jobs/:jobId/applications
router.use('/:jobId/applications', apiApplicationRouter);

module.exports = router;
