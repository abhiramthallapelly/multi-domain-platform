const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ Connection error:', err));

const doctorRoutes = require('./routes/doctors');
const trackingRoutes = require('./routes/tracking');

app.use('/api/doctors', doctorRoutes);
app.use('/api/tracking', trackingRoutes);

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));