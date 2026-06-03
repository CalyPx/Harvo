const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Listing = require('../models/Listing');

// POST /api/orders  — vendor places order
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') return res.status(403).json({ message: 'Only vendors can place orders' });

    const { listingId, quantity } = req.body;
    const listing = await Listing.findById(listingId).populate('farmer');
    if (!listing || listing.status !== 'available') return res.status(400).json({ message: 'Listing not available' });

    const order = await Order.create({
      listing: listingId,
      farmer: listing.farmer._id,
      vendor: req.user.id,
      quantity,
      agreedPrice: listing.pricePerKg,
      totalAmount: quantity * listing.pricePerKg
    });

    // Mark listing as ordered
    await Listing.findByIdAndUpdate(listingId, { status: 'ordered' });

    // Notify farmer via Socket.io
    req.app.get('io').emit('new_order', { order, farmerPhone: listing.farmer.phone });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/my  — get orders for logged-in user
router.get('/my', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'farmer' ? { farmer: req.user.id } : { vendor: req.user.id };
    const orders = await Order.find(filter)
      .populate('listing', 'crop quantity pricePerKg district')
      .populate('farmer', 'name phone district')
      .populate('vendor', 'name phone district')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id  — update order status
router.patch('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });

    // If completed, mark listing completed too
    if (req.body.status === 'completed') {
      await Listing.findByIdAndUpdate(order.listing, { status: 'completed' });
      req.app.get('io').emit('order_completed', order);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
