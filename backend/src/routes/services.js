const express = require('express');
const router = express.Router();

// GET /api/v1/services
// Get all services
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Oil Change',
        description: 'Complete oil change service',
        price: 50,
        duration: '1 hour'
      },
      {
        id: 2,
        name: 'Brake Service',
        description: 'Brake inspection and repair',
        price: 150,
        duration: '2 hours'
      }
    ]
  });
});

module.exports = router;