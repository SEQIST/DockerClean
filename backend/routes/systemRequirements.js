const express = require('express');
const router = express.Router();
const SystemRequirement = require('../models/SystemRequirement');

// Neue Systemanforderung erstellen
router.post('/', async (req, res) => {
  try {
    const systemReq = new SystemRequirement(req.body);
    await systemReq.save();
    res.status(201).json(systemReq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Systemanforderungen für ein Projekt abrufen
router.get('/:projectId', async (req, res) => {
  try {
    const systemReqs = await SystemRequirement.find({ projectId: req.params.projectId });
    res.json(systemReqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Systemanforderung aktualisieren (z. B. für Drag-and-Drop)
router.put('/:id', async (req, res) => {
  try {
    const systemReq = await SystemRequirement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(systemReq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;