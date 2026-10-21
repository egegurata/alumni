/**
 * ApplicationController (Web / View Layer) — controllers/ApplicationController.js
 * Week 06: Candidate Applications Web Interface
 */

const Application = require('../models/Application');
const JobPosting = require('../models/JobPosting');
const User = require('../models/User');

class ApplicationController {
  static async getAll(req, res) {
    try {
      const applications = await Application.findAll(req.query);
      const users = await User.findAll();
      const jobs = await JobPosting.findAll();
      return res.status(200).render('applications.html', {
        applications,
        users,
        jobs,
        success: req.query.success,
        error: req.query.error
      });
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  static async getById(req, res) {
    try {
      const application = await Application.findByIdWithDetails(req.params.id);
      if (!application) {
        return res.status(404).send('Application not found');
      }
      return res.status(200).render('applicationDetail.html', { application });
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  static async getByUser(req, res) {
    try {
      const userId = req.params.userId || req.params.id;
      const user = await User.findById(userId, { includeJobs: true });
      if (!user) {
        return res.status(404).send('User not found');
      }
      const applications = await Application.findByUser(userId);
      const users = await User.findAll();
      const jobs = await JobPosting.findAll();
      return res.status(200).render('applications.html', {
        applications,
        users,
        jobs,
        filterUser: user
      });
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  static async getByJob(req, res) {
    try {
      const jobId = req.params.jobId || req.params.id;
      const job = await JobPosting.findByIdWithUser(jobId);
      if (!job) {
        return res.status(404).send('Job posting not found');
      }
      const applications = await Application.findByJob(jobId);
      const users = await User.findAll();
      const jobs = await JobPosting.findAll();
      return res.status(200).render('applications.html', {
        applications,
        users,
        jobs,
        filterJob: job
      });
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  static async create(req, res) {
    try {
      const payload = { ...req.body };
      if (req.params.jobId) payload.job_posting_id = Number(req.params.jobId);
      if (req.params.userId) payload.user_id = Number(req.params.userId);

      await Application.create(payload);
      return res.redirect('/applications?success=created');
    } catch (error) {
      if (error.statusCode === 409) {
        return res.status(409).redirect(`/applications?error=${encodeURIComponent(error.message)}`);
      }
      if (error.statusCode === 404 || error.statusCode === 400) {
        return res.redirect(`/applications?error=${encodeURIComponent(error.message)}`);
      }
      return res.status(500).send('Internal Server Error');
    }
  }

  static async update(req, res) {
    try {
      const updated = await Application.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).send('Application not found');
      }
      return res.redirect('/applications?success=updated');
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }

  static async delete(req, res) {
    try {
      const deleted = await Application.delete(req.params.id);
      if (!deleted) {
        return res.status(404).send('Application not found');
      }
      return res.redirect('/applications?success=deleted');
    } catch (error) {
      return res.status(500).send('Internal Server Error');
    }
  }
}

module.exports = ApplicationController;
