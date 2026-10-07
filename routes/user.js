/**
 * Web User Routes — routes/user.js
 * Week 04 & Week 06
 */

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const JobPostingController = require('../controllers/JobPostingController');
const ApplicationController = require('../controllers/ApplicationController');

router.get('/', UserController.getAll);
router.post('/', UserController.create);
router.get('/:id', UserController.getById);
router.get('/:id/edit', UserController.getEditForm);
router.post('/:id/edit', UserController.update);
router.post('/:id/delete', UserController.delete);

// Nested Web views (Week 06 item 8: "A page for one user, with their postings")
router.get('/:userId/jobs', JobPostingController.getByUser);
router.post('/:userId/jobs', JobPostingController.create);
router.get('/:userId/applications', ApplicationController.getByUser);

module.exports = router;
