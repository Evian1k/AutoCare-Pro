const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      overview: {
        totalUsers: 0,
        totalTrucks: 0,
        activeBookings: 0,
        totalRevenue: 0
      },
      recentActivity: []
    }
  });
});

module.exports = router;