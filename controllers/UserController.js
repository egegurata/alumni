/**
 * UserController (Web / View Layer) — controllers/UserController.js
 * Weeks 04, 05, 06
 *
 * Renders HTML views for human users (/users, /users/:id, /users/:id/edit).
 * Week 06 item 8: "A page for one user, with their postings."
 */

const User = require('../models/User');

class UserController {
  static async getAll(req, res) {
    try {
      const users = await User.findAll();
      return res.status(200).render('users.html', {
        users,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  static async getById(req, res) {
    try {
      // Includes user's job postings and applications for the profile page (Week 06 item 8)
      const user = await User.findByIdWithApplications(req.params.id);
      if (!user) {
        return res.status(404).send('User not found');
      }
      return res.status(200).render('userDetail.html', {
        user,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  static async getEditForm(req, res) {
    try {
      const user = await User.findById(req.params.id, { includeJobs: false });
      if (!user) {
        return res.status(404).send('User not found');
      }
      return res.status(200).render('userEdit.html', { user });
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  static async create(req, res) {
    try {
      await User.create(req.body);
      return res.redirect('/users?success=created');
    } catch (error) {
      if (error.statusCode === 400) {
        return res.status(400).redirect(`/users?error=${encodeURIComponent(error.message)}`);
      }
      if (error.statusCode === 409) {
        return res.status(409).redirect(`/users?error=${encodeURIComponent(error.message)}`);
      }
      return res.status(500).send('Internal Server Error');
    }
  }

  static async update(req, res) {
    try {
      const updated = await User.update(req.params.id, req.body, true);
      if (!updated) {
        return res.status(404).send('User not found');
      }
      return res.redirect('/users?success=updated');
    } catch (error) {
      if (error.statusCode === 400 || error.statusCode === 409) {
        return res.redirect(`/users?error=${encodeURIComponent(error.message)}`);
      }
      return res.status(500).send('Internal Server Error');
    }
  }

  static async delete(req, res) {
    try {
      const deleted = await User.delete(req.params.id);
      if (!deleted) {
        return res.status(404).send('User not found');
      }
      return res.redirect('/users?success=deleted');
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = UserController;
