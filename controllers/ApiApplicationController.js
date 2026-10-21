/**
 * ApiApplicationController — controllers/ApiApplicationController.js
 * Week 06: Relational Data & Advanced Routing — Applications (Many-to-Many Join Table)
 *
 * Strict Specifications from Lecture Notes (Week 06 Item 7):
 * - "POST /api/jobs/:id/applications (201, 409 for the second time, 404 for no posting or user)"
 * - "and the two lists of applicants and applications":
 *   1. GET /api/jobs/:id/applications -> list of applicants for a job posting (404 if job unknown)
 *   2. GET /api/users/:id/applications -> list of applications by a user (404 if user unknown)
 */

const Application = require('../models/Application');
const JobPosting = require('../models/JobPosting');
const User = require('../models/User');

class ApiApplicationController {
  static async getAll(req, res) {
    try {
      const filters = { ...req.query };
      const nestedUserId = req.params.userId;
      const nestedJobId = req.params.jobId;

      if (nestedUserId !== undefined) {
        const user = await User.findById(nestedUserId, { includeJobs: false });
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        filters.user_id = Number(nestedUserId);
      }

      if (nestedJobId !== undefined) {
        const job = await JobPosting.findById(nestedJobId);
        if (!job) {
          return res.status(404).json({ error: 'Job posting not found' });
        }
        filters.job_posting_id = Number(nestedJobId);
      }

      const applications = await Application.findAll(filters);
      return res.status(200).json(applications);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getById(req, res) {
    try {
      const appId = req.params.applicationId !== undefined ? req.params.applicationId : req.params.id;
      const application = await Application.findByIdWithDetails(appId);

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      if (req.params.userId !== undefined && Number(application.user_id) !== Number(req.params.userId)) {
        return res.status(404).json({ error: 'Application not found for this user' });
      }

      if (req.params.jobId !== undefined && Number(application.job_posting_id) !== Number(req.params.jobId)) {
        return res.status(404).json({ error: 'Application not found for this job posting' });
      }

      return res.status(200).json(application);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async create(req, res) {
    try {
      const payload = { ...req.body };

      if (req.params.userId !== undefined) {
        payload.user_id = Number(req.params.userId);
      }
      if (req.params.jobId !== undefined) {
        payload.job_posting_id = Number(req.params.jobId);
      }

      const created = await Application.create(payload);
      return res.status(201).json(created);
    } catch (error) {
      if (error.statusCode === 409 || (error.message && error.message.startsWith('ALREADY_APPLIED'))) {
        return res.status(409).json({ error: error.message });
      }
      if (error.statusCode === 404 || (error.message && (error.message.startsWith('USER_NOT_FOUND') || error.message.startsWith('JOB_NOT_FOUND')))) {
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
      const appId = req.params.applicationId !== undefined ? req.params.applicationId : req.params.id;
      const updated = await Application.update(appId, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Application not found' });
      }
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async partialUpdate(req, res) {
    try {
      const appId = req.params.applicationId !== undefined ? req.params.applicationId : req.params.id;
      const updated = await Application.update(appId, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Application not found' });
      }
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async delete(req, res) {
    try {
      const appId = req.params.applicationId !== undefined ? req.params.applicationId : req.params.id;
      const deleted = await Application.delete(appId);
      if (!deleted) {
        return res.status(404).json({ error: 'Application not found' });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = ApiApplicationController;
