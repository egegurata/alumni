/**
 * ApiUserController — controllers/ApiUserController.js
 * Weeks 03, 04, 05, 06
 *
 * Strict Specifications from Lecture Notes:
 * - GET /api/users -> 200 OK with full array of users
 * - GET /api/users/:id -> 200 OK with user object INCLUDING `jobs` array (via LEFT JOIN), or 404 Not Found
 * - POST /api/users -> 201 Created with the created user, 400 if email missing/invalid, 409 if duplicate email
 * - PUT /api/users/:id -> 200 OK (full replacement), 400 if invalid, 404 if unknown id, 409 if duplicate email
 * - PATCH /api/users/:id -> 200 OK (partial update), 400 if invalid, 404 if unknown id, 409 if duplicate email
 * - DELETE /api/users/:id -> 204 No Content with NO body (or 404 Not Found if unknown id)
 */

const User = require('../models/User');

class ApiUserController {
  static async getAll(req, res) {
    try {
      const users = await User.findAll();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getById(req, res) {
    try {
      const numericId = Number(req.params.id);
      if (isNaN(numericId)) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Week 06: "GET /api/users/1 answers the user with a jobs array inside — one answer, two tables."
      const user = await User.findById(numericId, { includeJobs: true });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async create(req, res) {
    try {
      const createdUser = await User.create(req.body);
      return res.status(201).json(createdUser);
    } catch (error) {
      if (error.statusCode === 400 || (error.message && error.message.startsWith('VALIDATION_ERROR'))) {
        return res.status(400).json({ error: error.message });
      }
      if (error.statusCode === 409 || (error.message && error.message.startsWith('CONFLICT_ERROR'))) {
        return res.status(409).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async update(req, res) {
    try {
      const numericId = Number(req.params.id);
      if (isNaN(numericId)) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await User.update(numericId, req.body, false);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(updatedUser);
    } catch (error) {
      if (error.statusCode === 400 || (error.message && error.message.startsWith('VALIDATION_ERROR'))) {
        return res.status(400).json({ error: error.message });
      }
      if (error.statusCode === 409 || (error.message && error.message.startsWith('CONFLICT_ERROR'))) {
        return res.status(409).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async partialUpdate(req, res) {
    try {
      const numericId = Number(req.params.id);
      if (isNaN(numericId)) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedUser = await User.update(numericId, req.body, true);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(updatedUser);
    } catch (error) {
      if (error.statusCode === 400 || (error.message && error.message.startsWith('VALIDATION_ERROR'))) {
        return res.status(400).json({ error: error.message });
      }
      if (error.statusCode === 409 || (error.message && error.message.startsWith('CONFLICT_ERROR'))) {
        return res.status(409).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async delete(req, res) {
    try {
      const numericId = Number(req.params.id);
      if (isNaN(numericId)) {
        return res.status(404).json({ error: 'User not found' });
      }

      const deletedUser = await User.delete(numericId);
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Week 03 Rule: "DELETE /api/users/:id answers 204 with no body; unknown id -> 404."
      return res.status(204).send();
    } catch (error) {
      if (error.statusCode === 409) {
        return res.status(409).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = ApiUserController;
