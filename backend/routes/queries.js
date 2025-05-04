// backend/routes/queries.js
const express = require('express');
const router = express.Router();
const Query = require('../models/Query');

// Abfrage speichern
router.post('/', async (req, res) => {
  try {
    const { name, entity, fields, dependencies, dependencyFields } = req.body;
    const query = new Query({
      name,
      entity,
      fields,
      dependencies,
      dependencyFields,
    });
    await query.save();
    res.status(201).json(query);
  } catch (error) {
    console.error('Fehler beim Speichern der Abfrage:', error);
    res.status(500).json({ error: 'Fehler beim Speichern der Abfrage' });
  }
});

// Abfragen abrufen
router.get('/', async (req, res) => {
  try {
    const queries = await Query.find();
    res.json(queries);
  } catch (error) {
    console.error('Fehler beim Abrufen der Abfragen:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Abfragen' });
  }
});

module.exports = router;