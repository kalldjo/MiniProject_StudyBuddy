// minimal backend server boilerplate
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'study-buddy-backend' });
});

app.listen(PORT, () => {
  console.log(`[backend] server running on port ${PORT}`);
});
