const express = require('express');
const router = express.Router();
const Release = require('../models/Release');

// POST /api/releases
router.post('/', async (req, res) => {
  try {
    console.log('Empfangene Daten für Release:', req.body);
    const release = new Release(req.body);
    const savedRelease = await release.save();
    console.log('Gespeicherter Release:', savedRelease);
    res.status(201).json(savedRelease);
  } catch (error) {
    console.error('Fehler beim Erstellen des Releases:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(400).json({ error: error.message });
  }
});

// GET /api/releases?projectId=:id
router.get('/', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    console.log('Starte Abruf von Releases für Projekt:', projectId);
    const query = projectId ? { project: projectId } : {};
    const releases = await Release.find(query)
      .populate('workProducts.workProduct')
      .populate('project');
    console.log('Releases abgerufen:', releases);
    res.json(releases);
  } catch (error) {
    console.error('Fehler beim Abrufen der Releases:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/releases/:id
router.put('/:id', async (req, res) => {
  try {
    console.log('Empfangene Daten für Release (PUT):', req.body);
    const release = await Release.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!release) return res.status(404).json({ error: 'Release not found' });
    res.json(release);
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Releases:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/releases/:id
router.delete('/:id', async (req, res) => {
  try {
    const release = await Release.findByIdAndDelete(req.params.id);
    if (!release) return res.status(404).json({ error: 'Release not found' });
    res.json({ message: 'Release deleted' });
  } catch (error) {
    console.error('Fehler beim Löschen des Releases:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;