/**
 * Web Job Posting Routes — routes/jobPosting.js
 * Week 06
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const JobPostingController = require('../controllers/JobPostingController');
const ApplicationController = require('../controllers/ApplicationController');

router.get('/', JobPostingController.getAll);
router.post('/', JobPostingController.create);
router.get('/:id', JobPostingController.getById);
router.get('/:id/edit', JobPostingController.getEditForm);
router.post('/:id/edit', JobPostingController.update);
router.post('/:id/delete', JobPostingController.delete);

router.get('/:jobId/applications', ApplicationController.getByJob);
router.post('/:jobId/applications', ApplicationController.create);

module.exports = router;
