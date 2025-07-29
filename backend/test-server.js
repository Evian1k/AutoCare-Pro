const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ message: 'Test server working!' });
});

app.listen(3002, () => {
  console.log('Test server running on port 3002');
}); 