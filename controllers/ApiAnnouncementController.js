/**
 * ApiAnnouncementController — controllers/ApiAnnouncementController.js
 * Week 04 Homework & Week 05 Database Integration
 */

const Announcement = require('../models/Announcement');

class ApiAnnouncementController {
  static async getAll(req, res) {
    try {
      const announcements = await Announcement.findAll();
      return res.status(200).json(announcements);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getById(req, res) {
    try {
      const announcement = await Announcement.findById(req.params.id);
      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      return res.status(200).json(announcement);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async create(req, res) {
    try {
      const created = await Announcement.create(req.body);
      return res.status(201).json(created);
    } catch (error) {
      if (error.statusCode === 400 || (error.message && error.message.startsWith('VALIDATION_ERROR'))) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async update(req, res) {
    try {
      const updated = await Announcement.update(req.params.id, req.body, false);
      if (!updated) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      return res.status(200).json(updated);
    } catch (error) {
      if (error.statusCode === 400 || (error.message && error.message.startsWith('VALIDATION_ERROR'))) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async partialUpdate(req, res) {
    try {
      const updated = await Announcement.update(req.params.id, req.body, true);
      if (!updated) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      return res.status(200).json(updated);
    } catch (error) {
      if (error.statusCode === 400 || (error.message && error.message.startsWith('VALIDATION_ERROR'))) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async delete(req, res) {
    try {
      const deleted = await Announcement.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = ApiAnnouncementController;
