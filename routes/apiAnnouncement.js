/**
 * API Announcement Routes — routes/apiAnnouncement.js
 * Week 04 Homework
 */

const express = require('express');
const router = express.Router();
const ApiAnnouncementController = require('../controllers/ApiAnnouncementController');

router.get('/', ApiAnnouncementController.getAll);
router.post('/', ApiAnnouncementController.create);
router.get('/:id', ApiAnnouncementController.getById);
router.put('/:id', ApiAnnouncementController.update);
router.patch('/:id', ApiAnnouncementController.partialUpdate);
router.delete('/:id', ApiAnnouncementController.delete);

module.exports = router;
