/**
 * Web Announcement Routes — routes/announcement.js
 * Week 04 Homework
 */

const express = require('express');
const router = express.Router();
const AnnouncementController = require('../controllers/AnnouncementController');

router.get('/', AnnouncementController.getAll);
router.post('/', AnnouncementController.create);
router.get('/:id', AnnouncementController.getById);
router.get('/:id/edit', AnnouncementController.getEditForm);
router.post('/:id/edit', AnnouncementController.update);
router.post('/:id/delete', AnnouncementController.delete);

module.exports = router;
