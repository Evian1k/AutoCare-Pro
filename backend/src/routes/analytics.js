const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      users: 0,
      trucks: 0,
      bookings: 0,
      revenue: 0
    }
  });
});

module.exports = router;