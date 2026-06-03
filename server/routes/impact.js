const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Listing = require('../models/Listing');
const User = require('../models/User');

// GET /api/impact  — public impact stats
router.get('/', async (req, res) => {
  try {
    const completedOrders = await Order.find({ status: 'completed' });

    const totalKgSold       = completedOrders.reduce((sum, o) => sum + o.quantity, 0);
    const totalTransactions = completedOrders.length;
    const totalFarmers      = await User.countDocuments({ role: 'farmer' });
    const totalVendors      = await User.countDocuments({ role: 'vendor' });
    const totalListings     = await Listing.countDocuments();

    // Avg farmer price boost: assume traditional = Rs 20/kg, our platform avg
    const avgFarmerIncome        = completedOrders.reduce((sum, o) => sum + o.agreedPrice, 0) / (completedOrders.length || 1);
    const traditionalFarmerPrice = 20;
    const farmerExtraIncome      = Math.max(0, (avgFarmerIncome - traditionalFarmerPrice) * totalKgSold);
    const middlemenRemoved       = totalTransactions * 5; // avg 5 middlemen per chain

    res.json({
      totalFarmers,
      totalVendors,
      totalListings,
      totalTransactions,
      totalKgSold,
      farmerExtraIncome: Math.round(farmerExtraIncome),
      middlemenRemoved
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
