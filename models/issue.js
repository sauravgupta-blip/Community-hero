const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: {
    type: String,
    enum: ['Pothole', 'Water Leak', 'Broken Light', 'Garbage', 'Damaged Road', 'Other'],
    default: 'Other'
  },
  severity: { type: Number, min: 1, max: 5, default: 3 },
userSeverity: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  images: [String],
  status: {
    type: String,
    enum: ['open', 'verified', 'in-progress', 'resolved'],
    default: 'open'
  },
  createdBy: String,
  verifications: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', IssueSchema);