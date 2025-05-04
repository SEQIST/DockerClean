const express = require('express');
const router = express.Router();
const RegulatoryISO = require('../models/RegulatoryISO');
const RegulatoryContent = require('../models/RegulatoryContent');
const RegulatoryEvaluation = require('../models/RegulatoryEvaluation');

// GET: Alle Regulatorien abrufen
router.get('/', async (req, res) => {
  try {
    const regulatoryISOs = await RegulatoryISO.find();
    res.json(regulatoryISOs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST: Neue Regulatorie erstellen
router.post('/', async (req, res) => {
  try {
    const regulatoryISO = new RegulatoryISO(req.body);
    await regulatoryISO.save();
    res.status(201).json(regulatoryISO);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT: Regulatorie aktualisieren
router.put('/:id', async (req, res) => {
  try {
    const regulatoryISO = await RegulatoryISO.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!regulatoryISO) return res.status(404).json({ error: 'RegulatoryISO nicht gefunden' });
    res.json(regulatoryISO);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE: Regulatorie löschen
router.delete('/:id', async (req, res) => {
  try {
    const regulatoryISO = await RegulatoryISO.findByIdAndDelete(req.params.id);
    if (!regulatoryISO) return res.status(404).json({ error: 'RegulatoryISO nicht gefunden' });
    await RegulatoryContent.deleteMany({ regulatoryISO: req.params.id });
    await RegulatoryEvaluation.deleteMany({ regulatoryContent: { $in: await RegulatoryContent.find({ regulatoryISO: req.params.id }).select('_id') } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;