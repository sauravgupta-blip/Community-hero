const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// mongoose.connect(process.env.MONGO_URI)
//  .then(() => console.log('✅ MongoDB Connected'))
//  .catch(err => console.log('❌ DB Error:', err));

app.get('/health', (req, res) => {
  res.json({ status: 'Server Running ✅' });
});

app.use('/api/issues', require('./routes/issueRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
});