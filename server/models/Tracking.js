const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['start', 'update', 'stop'],
    required: true
  },
  location: {
    lat: Number,
    lng: Number,
    accuracy: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  emergencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emergency'
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Tracking', trackingSchema); 