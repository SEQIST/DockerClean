const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('../models/Event');

// GET /api/events?projectId=:projectId
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ message: 'projectId ist erforderlich' });
    }

    const events = await Event.find({ project: projectId }).populate('workProduct.workProduct release');
    console.log('Geladene Events:', events);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({ message: 'Fehler beim Abrufen der Events', error: error.message });
  }
});

// POST /api/events
router.post('/', async (req, res) => {
  try {
    console.log('Empfangene Daten für neues Event:', req.body);

    // Validierung der ObjectIds
    if (!mongoose.Types.ObjectId.isValid(req.body.release)) {
      return res.status(400).json({ message: 'Ungültige release-ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.body.project)) {
      return res.status(400).json({ message: 'Ungültige project-ID' });
    }

    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    const populatedEvent = await savedEvent.populate('workProduct.workProduct release');
    console.log('Gespeichertes Event:', populatedEvent);
    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Error adding event:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validierungsfehler', error: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Fehler beim Hinzufügen des Events', error: error.message });
  }
});

// PUT /api/events/:id
router.put('/:id', async (req, res) => {
  try {
    console.log('Empfangene Daten für Update Event:', req.body);

    // Validierung der ObjectIds
    if (req.body.release && !mongoose.Types.ObjectId.isValid(req.body.release)) {
      return res.status(400).json({ message: 'Ungültige release-ID' });
    }
    if (req.body.project && !mongoose.Types.ObjectId.isValid(req.body.project)) {
      return res.status(400).json({ message: 'Ungültige project-ID' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event nicht gefunden' });
    }
    const populatedEvent = await updatedEvent.populate('workProduct.workProduct release');
    console.log('Aktualisiertes Event:', populatedEvent);
    res.json(populatedEvent);
  } catch (error) {
    console.error('Error updating event:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validierungsfehler', error: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Events', error: error.message });
  }
});

module.exports = router;