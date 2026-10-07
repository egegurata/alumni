/**
 * AnnouncementController (Web / View Layer) — controllers/AnnouncementController.js
 * Week 04 Homework: "an announcement model, its two controllers, routes for both, and an interface to manage it"
 */

const Announcement = require('../models/Announcement');

class AnnouncementController {
  static async getAll(req, res) {
    try {
      const announcements = await Announcement.findAll();
      return res.status(200).render('announcements.html', {
        announcements,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  static async getById(req, res) {
    try {
      const announcement = await Announcement.findById(req.params.id);
      if (!announcement) {
        return res.status(404).send('Announcement not found');
      }
      return res.status(200).render('announcementDetail.html', { announcement });
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  static async getEditForm(req, res) {
    try {
      const announcement = await Announcement.findById(req.params.id);
      if (!announcement) {
        return res.status(404).send('Announcement not found');
      }
      return res.status(200).render('announcementEdit.html', { announcement });
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  static async create(req, res) {
    try {
      await Announcement.create(req.body);
      return res.redirect('/announcements?success=created');
    } catch (error) {
      if (error.statusCode === 400) {
        return res.redirect(`/announcements?error=${encodeURIComponent(error.message)}`);
      }
      return res.status(500).send('Internal Server Error');
    }
  }

  static async update(req, res) {
    try {
      const updated = await Announcement.update(req.params.id, req.body, true);
      if (!updated) {
        return res.status(404).send('Announcement not found');
      }
      return res.redirect('/announcements?success=updated');
    } catch (error) {
      if (error.statusCode === 400) {
        return res.redirect(`/announcements?error=${encodeURIComponent(error.message)}`);
      }
      return res.status(500).send('Internal Server Error');
    }
  }

  static async delete(req, res) {
    try {
      const deleted = await Announcement.delete(req.params.id);
      if (!deleted) {
        return res.status(404).send('Announcement not found');
      }
      return res.redirect('/announcements?success=deleted');
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = AnnouncementController;
