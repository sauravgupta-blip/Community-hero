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
 afterImage: { type: String, default: null },
  status: {
    type: String,
    enum: ['open', 'verified', 'in-progress', 'resolved'],
    default: 'open'
  },
  createdBy: String,
  isAnonymous: { type: Boolean, default: false },
  verifications: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', IssueSchema);