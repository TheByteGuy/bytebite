const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// test endpoint
app.get('/', (req, res) => {
  res.json({ message: "ByteBite API is running" });
});

// health check
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
