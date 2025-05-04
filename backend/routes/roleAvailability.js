const express = require('express');
const router = express.Router();
const RoleAvailabilityforCalculation = require('../models/RoleAvailabilityforCalculation');

// Hole alle Einträge für eine Rolle
router.get('/:roleId', async (req, res) => {
  try {
    const roleId = req.params.roleId;
    const availability = await RoleAvailabilityforCalculation.find({ roleId });
    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Füge einen neuen Eintrag hinzu
router.post('/', async (req, res) => {
  const roleAvailability = new RoleAvailabilityforCalculation({
    roleId: req.body.roleId,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    activityId: req.body.activityId,
  });

  try {
    const newRoleAvailability = await roleAvailability.save();
    res.status(201).json(newRoleAvailability);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Lösche alle Einträge (für Testzwecke)
router.delete('/', async (req, res) => {
  try {
    await RoleAvailabilityforCalculation.deleteMany({});
    res.json({ message: 'Alle Einträge gelöscht' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;