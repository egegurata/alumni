/**
 * ApiJobPostingController — controllers/ApiJobPostingController.js
 * Week 06: Relational Data & Advanced Routing — Job Postings
 *
 * Handles both:
 * - Nested Route: GET & POST /api/users/:id/jobs ("the jobs of this user", unknown user answers 404)
 * - Direct Route: GET, POST, PUT, PATCH, DELETE /api/jobs (and /api/jobs/:id)
 */

const JobPosting = require('../models/JobPosting');
const User = require('../models/User');

class ApiJobPostingController {
  static async getAll(req, res) {
    try {
      const filters = { ...req.query };
      const nestedUserId = req.params.userId !== undefined ? req.params.userId : req.params.id;

      if (nestedUserId !== undefined) {
        const user = await User.findById(nestedUserId, { includeJobs: false });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        filters.user_id = Number(nestedUserId);
      }

      const jobs = await JobPosting.findAll(filters);
      return res.status(200).json(jobs);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getById(req, res) {
    try {
      const jobId = req.params.jobId !== undefined ? req.params.jobId : req.params.id;
      const job = await JobPosting.findByIdWithUser(jobId);

      if (!job) {
        return res.status(404).json({ error: 'Job posting not found' });
      }

      const nestedUserId = req.params.userId;
      if (nestedUserId !== undefined && Number(job.user_id) !== Number(nestedUserId)) {
        return res.status(404).json({ error: 'Job posting not found for this user' });
      }

      return res.status(200).json(job);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async create(req, res) {
    try {
      const payload = { ...req.body };
      const nestedUserId = req.params.userId !== undefined ? req.params.userId : req.params.id;

      // Week 06: "Nested route. /api/users/:id/jobs means 'the jobs of this user'.
      // The URL, not the body, says whose posting it is."
      if (nestedUserId !== undefined) {
        const user = await User.findById(nestedUserId, { includeJobs: false });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        payload.user_id = Number(nestedUserId);
      }

      const created = await JobPosting.create(payload);
      return res.status(201).json(created);
    } catch (error) {
      if (error.statusCode === 404 || (error.message && error.message.startsWith('USER_NOT_FOUND'))) {
        return res.status(404).json({ error: error.message });
      }
      if (error.statusCode === 400 || (error.message && error.message.startsWith('VALIDATION_ERROR'))) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async update(req, res) {
    try {
      const jobId = req.params.jobId !== undefined ? req.params.jobId : req.params.id;
      const nestedUserId = req.params.userId;

      if (nestedUserId !== undefined) {
        const existing = await JobPosting.findById(jobId);
        if (!existing || Number(existing.user_id) !== Number(nestedUserId)) {
          return res.status(404).json({ error: 'Job posting not found for this user' });
        }
      }

      const updated = await JobPosting.update(jobId, req.body, false);
      if (!updated) {
        return res.status(404).json({ error: 'Job posting not found' });
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
      const jobId = req.params.jobId !== undefined ? req.params.jobId : req.params.id;
      const nestedUserId = req.params.userId;

      if (nestedUserId !== undefined) {
        const existing = await JobPosting.findById(jobId);
        if (!existing || Number(existing.user_id) !== Number(nestedUserId)) {
          return res.status(404).json({ error: 'Job posting not found for this user' });
        }
      }

      const updated = await JobPosting.update(jobId, req.body, true);
      if (!updated) {
        return res.status(404).json({ error: 'Job posting not found' });
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
      const jobId = req.params.jobId !== undefined ? req.params.jobId : req.params.id;
      const nestedUserId = req.params.userId;

      if (nestedUserId !== undefined) {
        const existing = await JobPosting.findById(jobId);
        if (!existing || Number(existing.user_id) !== Number(nestedUserId)) {
          return res.status(404).json({ error: 'Job posting not found for this user' });
        }
      }

      const deleted = await JobPosting.delete(jobId);
      if (!deleted) {
        return res.status(404).json({ error: 'Job posting not found' });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = ApiJobPostingController;
