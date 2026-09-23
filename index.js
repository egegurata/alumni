const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// 1 & 5. GET / -> temporary one-page home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. GET /hello -> answers Hello, World!
app.get('/hello', (req, res) => {
  res.status(200).send('Hello, World!');
});

// 3. GET /hello/{name} -> /hello/Emre answers Hello, Emre!
app.get('/hello/:name', (req, res) => {
  res.status(200).send(Hello, ${req.params.name}!);
});

// 4. GET /sum/{a}/{b} -> /sum/3/4 answers 7; /sum/3/banana answers 400
app.get('/sum/:a/:b', (req, res) => {
  const numA = Number(req.params.a);
  const numB = Number(req.params.b);
  if (req.params.a.trim() === '' || req.params.b.trim() === '' || isNaN(numA) || isNaN(numB)) {
    return res.status(400).json({ error: 'Both path segments must be valid numbers.' });
  }
  return res.status(200).send(String(numA + numB));
});

// 6. GET /about -> static sub-page
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

if (require.main === module) {
  app.listen(PORT, () => console.log(Server running on port ${PORT}));
}

module.exports = app;
