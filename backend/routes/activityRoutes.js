// backend/routes/activities.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const WorkProduct = require('../models/WorkProduct');

// Hilfsfunktion zur Validierung von ObjectIds
const isValidObjectId = (id) => {
  try {
    return mongoose.Types.ObjectId.isValid(id);
  } catch (error) {
    console.error('Fehler bei der Validierung der ObjectId:', error);
    return false;
  }
};

// POST /api/activities - Erstelle eine neue Aktivität
router.post('/', async (req, res) => {
  try {
    console.log('Erstelle neue Aktivität mit Daten:', req.body);

    if (req.body.trigger) {
      const { workProducts, determiningFactorId } = req.body.trigger;
      if (workProducts) {
        console.log('Prüfe Trigger-Work Products:', workProducts);
        if (determiningFactorId && !workProducts.some(wp => wp._id.toString() === determiningFactorId.toString())) {
          console.log('determiningFactorId nicht in Work Products:', determiningFactorId);
          return res.status(400).json({ error: 'determiningFactorId muss ein Work Product in der Liste sein' });
        }
        const determiningFactors = workProducts.filter(wp => wp.isDeterminingFactor);
        if (determiningFactors.length > 1) {
          console.log('Mehr als ein bestimmender Faktor gefunden:', determiningFactors);
          return res.status(400).json({ error: 'Nur ein Work Product kann der bestimmende Faktor sein' });
        }
      }
    }

    const { name, abbreviation, process, result, trigger } = req.body;
    const activityData = {
      name,
      abbreviation,
      process: process && process !== '' ? process : null, // Setze auf null, wenn leer
      result: result && result !== '' ? result : null,     // Setze auf null, wenn leer
      trigger: trigger || { workProducts: [] },
    };
    console.log('Daten, die gespeichert werden:', activityData);

    if (activityData.result) {
      const resultId = activityData.result;
      console.log(`Prüfe 1:1-Beziehung für Work Product ${resultId}...`);
      if (!isValidObjectId(resultId)) {
        console.error('Ungültige Work Product-ID:', resultId);
        return res.status(400).json({ error: 'Ungültige Work Product-ID' });
      }
      const existingActivity = await Activity.findOne({ result: resultId }).exec();
      if (existingActivity) {
        console.log('Work Product bereits einer Aktivität zugeordnet:', existingActivity._id);
        return res.status(400).json({ error: 'Dieses Work Product ist bereits einer anderen Aktivität zugeordnet.' });
      }
    }

    const activity = new Activity(activityData);
    const savedActivity = await activity.save();
    console.log('Aktivität erfolgreich gespeichert:', savedActivity._id);
    await savedActivity.populate('executedBy process result trigger.workProducts._id trigger.determiningFactorId');
    res.status(201).json(savedActivity);
  } catch (error) {
    console.error('Fehler beim Erstellen der Aktivität:', error);
    console.error('Fehler Stack:', error.stack);
    if (error.code === 11000) {
      console.log('Duplikat-Fehler: Name und Abkürzung bereits vorhanden');
      res.status(400).json({ error: 'Eine Aktivität mit diesem Namen und dieser Abkürzung existiert bereits.' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// PUT /api/activities/:id - Aktualisiere eine bestehende Aktivität
router.put('/:id', async (req, res) => {
  try {
    console.log(`Aktualisiere Aktivität mit ID: ${req.params.id}`);
    console.log('Aktualisierungsdaten:', req.body);

    if (!isValidObjectId(req.params.id)) {
      console.error('Ungültige Aktivität-ID:', req.params.id);
      return res.status(400).json({ error: 'Ungültige Aktivität-ID' });
    }

    if (req.body.trigger) {
      const { workProducts, determiningFactorId } = req.body.trigger;
      if (workProducts) {
        console.log('Prüfe Trigger-Work Products:', workProducts);
        if (determiningFactorId && !workProducts.some(wp => wp._id.toString() === determiningFactorId.toString())) {
          console.log('determiningFactorId nicht in Work Products:', determiningFactorId);
          return res.status(400).json({ error: 'determiningFactorId muss ein Work Product in der Liste sein' });
        }
        const determiningFactors = workProducts.filter(wp => wp.isDeterminingFactor);
        if (determiningFactors.length > 1) {
          console.log('Mehr als ein bestimmender Faktor gefunden:', determiningFactors);
          return res.status(400).json({ error: 'Nur ein Work Product kann der bestimmende Faktor sein' });
        }
      }
    }

    const { name, abbreviation, process, result, trigger } = req.body;
    const activityData = {
      name,
      abbreviation,
      process: process && process !== '' ? process : null,
      result: result && result !== '' ? result : null,
      trigger: trigger || { workProducts: [] },
    };
    console.log('Daten, die aktualisiert werden:', activityData);

    if (activityData.result) {
      const resultId = activityData.result;
      console.log(`Prüfe 1:1-Beziehung für Work Product ${resultId}...`);
      if (!isValidObjectId(resultId)) {
        console.error('Ungültige Work Product-ID:', resultId);
        return res.status(400).json({ error: 'Ungültige Work Product-ID' });
      }
      const existingActivity = await Activity.findOne({
        result: resultId,
        _id: { $ne: req.params.id },
      }).exec();
      if (existingActivity) {
        console.log('Work Product bereits einer anderen Aktivität zugeordnet:', existingActivity._id);
        return res.status(400).json({ error: 'Dieses Work Product ist bereits einer anderen Aktivität zugeordnet.' });
      }
    }

    const activity = await Activity.findByIdAndUpdate(req.params.id, activityData, { new: true, runValidators: true })
      .populate({ path: 'process', strictPopulate: false })
      .populate({ path: 'executedBy', strictPopulate: false })
      .populate({ path: 'result', strictPopulate: false })
      .populate({ path: 'trigger.workProducts._id', strictPopulate: false })
      .populate({ path: 'trigger.determiningFactorId', strictPopulate: false });
    if (!activity) {
      console.log('Aktivität nicht gefunden:', req.params.id);
      return res.status(404).json({ error: 'Activity not found' });
    }
    console.log('Aktualisierte Aktivität:', activity);
    res.json(activity);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Aktivität:', error);
    console.error('Fehler Stack:', error.stack);
    res.status(400).json({ error: error.message });
  }
});