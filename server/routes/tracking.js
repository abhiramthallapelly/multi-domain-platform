const express = require('express');
const Tracking = require('../models/Tracking');
const User = require('../models/User');
const router = express.Router();

// Start tracking session
router.post('/start', async (req, res) => {
  try {
    const { userId, location, emergencyId } = req.body;
    
    const tracking = new Tracking({
      userId,
      action: 'start',
      location,
      emergencyId
    });
    
    await tracking.save();
    
    // Update user location
    await User.findByIdAndUpdate(userId, {
      location: location
    });
    
    res.json({ success: true, trackingId: tracking._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update location
router.post('/update', async (req, res) => {
  try {
    const { userId, location } = req.body;
    
    const tracking = new Tracking({
      userId,
      action: 'update',
      location
    });
    
    await tracking.save();
    
    // Update user location
    await User.findByIdAndUpdate(userId, {
      location: location
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop tracking session
router.post('/stop', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const tracking = new Tracking({
      userId,
      action: 'stop'
    });
    
    await tracking.save();
    
    // Mark all active tracking sessions as inactive
    await Tracking.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active tracking sessions
router.get('/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const activeTracking = await Tracking.findOne({
      userId,
      isActive: true,
      action: 'start'
    }).sort({ timestamp: -1 });
    
    if (!activeTracking) {
      return res.json({ active: false });
    }
    
    // Get recent location updates
    const recentUpdates = await Tracking.find({
      userId,
      action: 'update',
      timestamp: { $gte: activeTracking.timestamp }
    }).sort({ timestamp: -1 }).limit(10);
    
    res.json({
      active: true,
      startTime: activeTracking.timestamp,
      recentLocations: recentUpdates.map(update => update.location)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tracking history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const history = await Tracking.find({ userId })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 