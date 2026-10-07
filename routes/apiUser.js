/**
 * API User Routes — routes/apiUser.js
 * Week 04: "A route only says which method and path go to which controller function — one line, no logic."
 * Week 06: Nested routes for /api/users/:userId/jobs and /api/users/:userId/applications
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const ApiUserController = require('../controllers/ApiUserController');
const apiJobPostingRouter = require('./apiJobPosting');
const apiApplicationRouter = require('./apiApplication');

router.get('/', ApiUserController.getAll);
router.post('/', ApiUserController.create);
router.get('/:id', ApiUserController.getById);
router.put('/:id', ApiUserController.update);
router.patch('/:id', ApiUserController.partialUpdate);
router.delete('/:id', ApiUserController.delete);

// Nested routes (Week 06)
router.use('/:userId/jobs', apiJobPostingRouter);
router.use('/:userId/applications', apiApplicationRouter);

module.exports = router;
