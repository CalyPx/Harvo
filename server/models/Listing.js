const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  farmer:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crop:       { type: String, required: true },      // e.g. "tomato"
  cropPhoto:  { type: String },                       // emoji or image URL
  quantity:   { type: Number, required: true },       // in kg
  pricePerKg: { type: Number, required: true },       // in NPR
  district:   { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  description: { type: String },
  status: {
    type: String,
    enum: ['available', 'ordered', 'completed'],
    default: 'available'
  }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
