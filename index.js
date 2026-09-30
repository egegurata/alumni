const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory users list (at least one alumnus and one who is not; counter only goes up)
let users = [
  { id: 1, name: 'Ege Gürkan Atalay', email: 'egegurkanatalay@ogr.iu.edu.tr', department: 'Management Information Systems', graduationYear: 2028, isAlumni: false },
  { id: 2, name: 'Elif Kaya', email: 'elif.kaya@alumni.iu.edu.tr', department: 'Management Information Systems', graduationYear: 2024, isAlumni: true },
  { id: 3, name: 'Mert Aydın', email: 'mert.aydin@alumni.iu.edu.tr', department: 'Management Information Systems', graduationYear: 2022, isAlumni: true }
];
let nextId = 4;

// 1. GET /api/health -> { status: "ok", uptime: ... }
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// 3 & 5. POST and GET /api/users
app.get('/api/users', (req, res) => {
  res.status(200).json(users);
});

app.post('/api/users', (req, res) => {
  const newUser = {
    id: nextId++,
    name: req.body.name || 'New User',
    email: req.body.email,
    department: req.body.department || 'Management Information Systems',
    graduationYear: Number(req.body.graduationYear) || 2026,
    isAlumni: Boolean(req.body.isAlumni)
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// 6. PATCH /api/users/:id -> changes only sent fields (200), unknown id -> 404
app.patch('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  Object.assign(user, req.body, { id });
  return res.status(200).json(user);
});

// 7. DELETE /api/users/:id -> 204 with no body; unknown id -> 404
app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'User not found' });
  users.splice(idx, 1);
  return res.status(204).send();
});

// 8. Homework 3: Swagger UI at /api/swagger
app.use('/api/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Week 02 routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/hello', (req, res) => res.status(200).send('Hello, World!'));
app.get('/hello/:name', (req, res) => res.status(200).send(Hello, ${req.params.name}!));
app.get('/sum/:a/:b', (req, res) => {
  const numA = Number(req.params.a);
  const numB = Number(req.params.b);
  if (isNaN(numA) || isNaN(numB)) return res.status(400).json({ error: 'Invalid numbers' });
  return res.status(200).send(String(numA + numB));
});

if (require.main === module) {
  app.listen(PORT, () => console.log(Server running on port ${PORT}));
}

module.exports = app;
