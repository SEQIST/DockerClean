const express = require('express');
const router = express.Router();
const ActivitySchedule = require('../models/ActivitySchedule');

// Hole alle Einträge für eine Aktivität
router.get('/:activityId', async (req, res) => {
  try {
    const activityId = req.params.activityId;
    const schedule = await ActivitySchedule.find({ activityId });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Füge einen neuen Eintrag hinzu
router.post('/', async (req, res) => {
  const activitySchedule = new ActivitySchedule({
    activityId: req.body.activityId,
    roleId: req.body.roleId,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    durationDays: req.body.durationDays,
    projectId: req.body.projectId || null,
    processId: req.body.processId || null,
  });

  try {
    const newActivitySchedule = await activitySchedule.save();
    res.status(201).json(newActivitySchedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Lösche alle Einträge (für Testzwecke)
router.delete('/', async (req, res) => {
  try {
    await ActivitySchedule.deleteMany({});
    res.json({ message: 'Alle Einträge gelöscht' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;