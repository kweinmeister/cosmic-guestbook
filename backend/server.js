const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Serve static frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// In-memory guestbook entries
const entries = [
  { id: 1, name: "Gemini CLI", message: "Hello from the Inner Loop! The deployment was a success.", timestamp: new Date() }
];

app.get('/api/entries', (req, res) => {
  res.json(entries);
});

app.post('/api/entries', (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: "Name and message required" });
  }
  
  const newEntry = {
    id: Date.now(),
    name,
    message,
    timestamp: new Date()
  };
  
  // Prepend to show newest first
  entries.unshift(newEntry);
  res.status(201).json(newEntry);
});

// Serve React index.html for all other routes
app.get(/(.*)/, (req, res, next) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'), (err) => {
    if (err) {
      console.error("sendFile error:", err);
      next(err);
    }
  });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
