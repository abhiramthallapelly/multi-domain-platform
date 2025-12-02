const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: String,
  specialty: String,
  location: String,
  locationCoords: {
    lat: Number,
    lng: Number
  },
  available: Boolean,
  rating: Number,
  experience: String,
  consultationFee: Number,
  responseTime: String,
  avatar: String
});

module.exports = mongoose.model('Doctor', doctorSchema);