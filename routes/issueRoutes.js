const express = require('express');
const Issue = require('../models/issue');
const { analyzeIssue } = require('../services/googleAIService');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { imageBase64, description, latitude, longitude, address, userId } = req.body;
    
    const analysis = await analyzeIssue(imageBase64, description);
    
    const issue = new Issue({
      title: analysis.category,
      description,
      category: analysis.category,
      severity: analysis.severity,
      location: { lat: latitude, lng: longitude, address: address || 'Unknown location' },
      images: [imageBase64],
      createdBy: userId || 'anonymous',
      status: 'open'
    });
    
    await issue.save();
    
    res.json({
      success: true,
      issue: { _id: issue._id, category: issue.category, severity: issue.severity },
      analysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: issues.length, issues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    res.json({ success: true, issue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/verify', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    issue.verifications += 1;
    
    if (issue.verifications >= 3 && issue.status === 'open') {
      issue.status = 'verified';
    }
    
    await issue.save();
    res.json({ success: true, verifications: issue.verifications, status: issue.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats/all', async (req, res) => {
  try {
    const total = await Issue.countDocuments();
    const byCategory = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      totalIssues: total,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;