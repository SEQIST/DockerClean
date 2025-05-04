const express = require('express');
const router = express.Router();
const RegulatoryEvaluation = require('../models/RegulatoryEvaluation');

// GET all regulatory evaluations or filter by regulatoryContent
router.get('/', async (req, res) => {
  try {
    const { regulatoryContent } = req.query;
    let query = {};

    if (regulatoryContent) {
      query.regulatoryContent = regulatoryContent;
    }

    const evaluations = await RegulatoryEvaluation.find(query)
      .populate('regulatoryContent')
      .populate('evidencedBy.roles') // Populiere Rollen
      .populate('evidencedBy.processes') // Populiere Prozesse
      .populate('evidencedBy.activities') // Populiere Aktivitäten
      .populate('evidencedBy.workProducts'); // Populiere Work Products

    console.log('Fetched Evaluations:', evaluations);
    res.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST a new regulatory evaluation
router.post('/', async (req, res) => {
  try {
    const evaluation = new RegulatoryEvaluation(req.body);
    const savedEvaluation = await evaluation.save();
    const populatedEvaluation = await RegulatoryEvaluation.findById(savedEvaluation._id)
      .populate('regulatoryContent')
      .populate('evidencedBy.roles')
      .populate('evidencedBy.processes')
      .populate('evidencedBy.activities')
      .populate('evidencedBy.workProducts');
    console.log('Saved and Populated Evaluation:', populatedEvaluation);
    res.status(201).json(populatedEvaluation);
  } catch (error) {
    console.error('Error creating evaluation:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT (update) an existing regulatory evaluation by ID
router.put('/:id', async (req, res) => {
  try {
    const evaluation = await RegulatoryEvaluation.findById(req.params.id);
    if (!evaluation) {
      console.log(`Evaluation with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    Object.assign(evaluation, req.body);
    const updatedEvaluation = await evaluation.save();
    const populatedEvaluation = await RegulatoryEvaluation.findById(updatedEvaluation._id)
      .populate('regulatoryContent')
      .populate('evidencedBy.roles')
      .populate('evidencedBy.processes')
      .populate('evidencedBy.activities')
      .populate('evidencedBy.workProducts');
    console.log('Updated Evaluation:', populatedEvaluation);
    res.json(populatedEvaluation);
  } catch (error) {
    console.error('Error in PUT /api/regulatory-evaluations/:id:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE a regulatory evaluation by ID
router.delete('/:id', async (req, res) => {
  try {
    const evaluation = await RegulatoryEvaluation.findByIdAndDelete(req.params.id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }
    res.json({ message: 'Evaluation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;