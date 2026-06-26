const express = require('express');
const Issue = require('../models/issue');
const { analyzeIssue } = require('../services/googleAIService');

const router = express.Router();

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.post('/', async (req, res) => {
  try {
    const { imageBase64, description, latitude, longitude, address, userId, userSeverity, isAnonymous } = req.body;

    const analysis = await analyzeIssue(imageBase64, description);
    const category = analysis.category;

    const nearbyIssues = await Issue.find({
      category,
      status: { $in: ['open', 'verified', 'in-progress'] }
    });

    let duplicate = null;
    for (const existing of nearbyIssues) {
      if (existing.location && existing.location.lat && existing.location.lng) {
        const dist = getDistanceMeters(latitude, longitude, existing.location.lat, existing.location.lng);
        if (dist <= 50) {
          duplicate = existing;
          break;
        }
      }
    }

    if (duplicate) {
      duplicate.verifications += 1;
      if (duplicate.verifications >= 3 && duplicate.status === 'open') {
        duplicate.status = 'verified';
      }
      await duplicate.save();

      return res.json({
        success: true,
        duplicate: true,
        issue: { _id: duplicate._id, category: duplicate.category, severity: duplicate.severity, verifications: duplicate.verifications },
        analysis
      });
    }

    const issue = new Issue({
      title: analysis.category,
      description,
      category: analysis.category,
      severity: analysis.severity,
      userSeverity: userSeverity || 'Medium',
      location: { lat: latitude, lng: longitude, address: address || 'Unknown location' },
      images: [imageBase64],
      createdBy: isAnonymous ? 'Anonymous' : (userId || 'user123'),
      isAnonymous: !!isAnonymous,
      status: 'open'
    });

    await issue.save();

    res.json({
      success: true,
      duplicate: false,
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

router.post('/:id/vote', async (req, res) => {
  try {
    const { upvoteDelta, downvoteDelta } = req.body;
    const update = {};
    if (upvoteDelta) update.upvotes = upvoteDelta;
    if (downvoteDelta) update.downvotes = downvoteDelta;

    const issue = await Issue.findById(req.params.id);
    issue.upvotes = Math.max(0, (issue.upvotes || 0) + (upvoteDelta || 0));
    issue.downvotes = Math.max(0, (issue.downvotes || 0) + (downvoteDelta || 0));
    await issue.save();

    res.json({ success: true, upvotes: issue.upvotes, downvotes: issue.downvotes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status, afterImage } = req.body;
    const validStatuses = ['open', 'verified', 'in-progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const update = { status };
    if (afterImage) update.afterImage = afterImage;
    const issue = await Issue.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, issue });
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