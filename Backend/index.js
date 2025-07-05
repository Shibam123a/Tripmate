const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // default for Laragon
  database: 'form_db',
});

// Connect to DB
db.connect(err => {
  if (err) {
    console.error('DB connection failed:', err);
  } else {
    console.log('Connected to MySQL DB');
  }
});

// POST API to submit form
app.post('/api/submit-form', (req, res) => {
  const { name, email, phone, message } = req.body;
  const sql = `INSERT INTO contact_forms (full_name, email, phone, message) VALUES (?, ?, ?, ?)`;

  db.query(sql, [name, email, phone, message], (err, result) => {
    if (err) {
      console.error('Insert failed:', err);
      res.status(500).json({ success: false, error: err.message });
    } else {
      res.json({ success: true, message: 'Form submitted successfully' });
    }
  });
});

// GET API to fetch all form submissions
app.get('/api/forms', (req, res) => {
  const sql = `SELECT * FROM contact_forms ORDER BY submitted_at DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Fetch failed:', err);
      res.status(500).json({ success: false, error: err.message });
    } else {
      res.json({ success: true, data: results });
    }
  });
});

// POST API to save planning data
app.post('/api/save-planning', (req, res) => {
  const { source, destination, budget, vehicle, stoppageDistance, startDate } = req.body;

  if (!source || !destination) {
    return res.status(400).json({ message: 'Source and destination are required' });
  }

  const sql = `INSERT INTO planning_data (source, destination, budget, vehicle, stoppage_distance, start_date) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [source, destination, budget, vehicle, stoppageDistance, startDate], (err, result) => {
    if (err) {
      console.error('Insert failed:', err);
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({ success: true, message: 'Planning data saved successfully' });
  });
});

// POST API to save feedback data
app.post('/api/save-feedback', (req, res) => {
  const { rating, issue, others, feedback } = req.body;

  // if (!rating || !issue || !feedback) {
  //   return res.status(400).json({ success: false, message: 'Missing required fields' });
  // }

   // Check if any field is undefined
  if (rating === undefined || issue === undefined || feedback === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = `INSERT INTO feedback_data (rating, issue, others, feedback) VALUES (?, ?, ?, ?)`;

  db.query(sql, [rating, issue, others, feedback], (err, result) => {
    if (err) {
      console.error('Insert failed:', err);
      return res.status(500).json({ success: false, message: 'Failed to save feedback', error: err.message });
    }

    res.json({ success: true, message: 'Feedback submitted successfully!' });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
