const express = require('express');
const router = express.Router();
const LikelihoodMatrix = require('../models/LikelihoodMatrix');
const SeverityMatrix = require('../models/SeverityMatrix');
const Risk = require('../models/Risk');

// GET: All Risks
router.get('/risks', async (req, res) => {
  try {
    const risks = await Risk.find()
      .populate('category')
      .populate('strategy')
      .populate('workProducts');
    res.json(risks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Single Risk by ID
router.get('/risks/:id', async (req, res) => {
  try {
    const risk = await Risk.findById(req.params.id)
      .populate('category')
      .populate('strategy')
      .populate('workProducts');
    if (!risk) {
      return res.status(404).json({ message: 'Risiko nicht gefunden' });
    }
    res.json(risk);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Create a new risk
router.post('/risks', async (req, res) => {
  const risk = new Risk(req.body);
  try {
    const newRisk = await risk.save();
    const populatedRisk = await Risk.findById(newRisk._id)
      .populate('category')
      .populate('strategy')
      .populate('workProducts');
    res.status(201).json(populatedRisk);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT: Update an existing risk
router.put('/risks/:id', async (req, res) => {
  try {
    const risk = await Risk.findById(req.params.id);
    if (!risk) return res.status(404).json({ message: 'Risiko nicht gefunden' });
    Object.assign(risk, req.body);
    const updatedRisk = await risk.save();
    const populatedRisk = await Risk.findById(updatedRisk._id)
      .populate('category')
      .populate('strategy')
      .populate('workProducts');
    res.json(populatedRisk);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Delete a risk
router.delete('/risks/:id', async (req, res) => {
  try {
    const risk = await Risk.findById(req.params.id);
    if (!risk) return res.status(404).json({ message: 'Risiko nicht gefunden' });
    await risk.remove();
    res.json({ message: 'Risiko gelöscht' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Likelihood Matrix
router.get('/likelihood', async (req, res) => {
  try {
    const likelihoodMatrix = await LikelihoodMatrix.find().sort({ level: 1 });
    res.json(likelihoodMatrix);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Severity Matrix
router.get('/severity', async (req, res) => {
  try {
    const severityMatrix = await SeverityMatrix.find().sort({ level: 1 });
    res.json(severityMatrix);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Create Likelihood Matrix
router.post('/likelihood', async (req, res) => {
  try {
    const likelihoodData = req.body;
    const insertedData = await LikelihoodMatrix.insertMany(likelihoodData);
    res.status(201).json(insertedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST: Create Severity Matrix
router.post('/severity', async (req, res) => {
  try {
    const severityData = req.body;
    const insertedData = await SeverityMatrix.insertMany(severityData);
    res.status(201).json(insertedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT: Update Likelihood Matrix
router.put('/likelihood', async (req, res) => {
  try {
    const updates = req.body;
    const updatedLikelihood = await Promise.all(
      updates.map(async (item) => {
        return await LikelihoodMatrix.findByIdAndUpdate(item._id, item, { new: true });
      })
    );
    res.json(updatedLikelihood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT: Update Severity Matrix
router.put('/severity', async (req, res) => {
  try {
    const updates = req.body;
    const updatedSeverity = await Promise.all(
      updates.map(async (item) => {
        return await SeverityMatrix.findByIdAndUpdate(item._id, item, { new: true });
      })
    );
    res.json(updatedSeverity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;