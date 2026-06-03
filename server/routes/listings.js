const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Listing = require('../models/Listing');

// GET /api/listings  — public, vendors browse
router.get('/', async (req, res) => {
  try {
    const { crop, district } = req.query;
    const filter = { status: 'available' };
    if (crop) filter.crop = crop;
    if (district) filter.district = district;

    const listings = await Listing.find(filter)
      .populate('farmer', 'name phone district')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/my  — farmer sees own listings
router.get('/my', auth, async (req, res) => {
  try {
    const listings = await Listing.find({ farmer: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/listings  — farmer creates listing
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ message: 'Only farmers can post listings' });

    const { crop, cropPhoto, quantity, pricePerKg, district, location, description } = req.body;
    const listing = await Listing.create({
      farmer: req.user.id, crop, cropPhoto, quantity, pricePerKg, district, location, description
    });

    // Notify vendors via Socket.io
    req.app.get('io').emit('new_listing', listing);

    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/listings/:id  — update status
router.patch('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/listings/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
