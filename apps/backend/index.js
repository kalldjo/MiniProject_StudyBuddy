// init db connection & server boilerplate
const express = require('express');
const recommendationController = require('./controllers/recommendationController');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'study-buddy-backend' });
});

// route endpoints for matching logic
app.get('/api/search', recommendationController.searchByFilters);
app.get('/api/recommend/interests', recommendationController.recommendByInterest);
app.get('/api/recommend/skills', recommendationController.recommendByProjectSkills);
app.get('/api/recommend/social', recommendationController.recommendBySocialProximity);

app.listen(PORT, () => {
  console.log(`[backend] server running on port ${PORT}`);
});
