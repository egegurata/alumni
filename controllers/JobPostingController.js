/**
 * JobPostingController (Web / View Layer) — controllers/JobPostingController.js
 * Week 06: Career & Job Postings Web Interface
 */

const JobPosting = require('../models/JobPosting');
const User = require('../models/User');

class JobPostingController {
  static async getAll(req, res) {
    try {
      const jobs = await JobPosting.findAll(req.query);
      const users = await User.findAll();
      return res.status(200).render('jobs.html', {
        jobs,
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
      const job = await JobPosting.findByIdWithUser(req.params.id);
      if (!job) {
        return res.status(404).send('Job posting not found');
      }
      const Application = require('../models/Application');
      const applications = await Application.findByJob(job.id);
      const users = await User.findAll();
      return res.status(200).render('jobDetail.html', {
        job,
        applications,
        users,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  static async getEditForm(req, res) {
    try {
      const job = await JobPosting.findById(req.params.id);
      if (!job) {
        return res.status(404).send('Job posting not found');
      }
      return res.status(200).render('jobEdit.html', { job });
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  static async getByUser(req, res) {
    try {
      const userId = req.params.userId || req.params.id;
      const user = await User.findByIdWithApplications(userId);
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

  static async create(req, res) {
    try {
      const payload = { ...req.body };
      if (req.params.userId) {
        payload.user_id = Number(req.params.userId);
      }
      await JobPosting.create(payload);
      if (req.params.userId) {
        return res.redirect(`/users/${req.params.userId}?success=job_created`);
      }
      return res.redirect('/jobs?success=created');
    } catch (error) {
      return res.redirect(`/jobs?error=${encodeURIComponent(error.message)}`);
    }
  }

  static async update(req, res) {
    try {
      const updated = await JobPosting.update(req.params.id, req.body, true);
      if (!updated) {
        return res.status(404).send('Job posting not found');
      }
      return res.redirect('/jobs?success=updated');
    } catch (error) {
      return res.redirect(`/jobs?error=${encodeURIComponent(error.message)}`);
    }
  }

  static async delete(req, res) {
    try {
      const deleted = await JobPosting.delete(req.params.id);
      if (!deleted) {
        return res.status(404).send('Job posting not found');
      }
      return res.redirect('/jobs?success=deleted');
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = JobPostingController;
