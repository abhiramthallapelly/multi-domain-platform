const express = require('express');
const Doctor = require('../models/Doctor');
const router = express.Router();

router.get('/', async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

router.post('/add', async (req, res) => {
  const newDoctor = new Doctor(req.body);
  await newDoctor.save();
  res.send('Doctor saved');
});

module.exports = router;