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
    availableFrom: req.body.availableFrom,
    availableHoursPerDay: req.body.availableHoursPerDay,
    restrictedHoursPerDay: req.body.restrictedHoursPerDay || 0,
    restrictedUntil: req.body.restrictedUntil || null,
    projectId: req.body.projectId || null,
    processId: req.body.processId || null,
  });

  try {
    const newRoleAvailability = await roleAvailability.save();
    res.status(201).json(newRoleAvailability);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Aktualisiere einen Eintrag
router.put('/:id', async (req, res) => {
  try {
    const roleAvailability = await RoleAvailabilityforCalculation.findById(req.params.id);
    if (!roleAvailability) {
      return res.status(404).json({ message: 'Role Availability for Calculation not found' });
    }

    roleAvailability.availableFrom = req.body.availableFrom || roleAvailability.availableFrom;
    roleAvailability.availableHoursPerDay = req.body.availableHoursPerDay || roleAvailability.availableHoursPerDay;
    roleAvailability.restrictedHoursPerDay = req.body.restrictedHoursPerDay || roleAvailability.restrictedHoursPerDay;
    roleAvailability.restrictedUntil = req.body.restrictedUntil || roleAvailability.restrictedUntil;
    roleAvailability.projectId = req.body.projectId || roleAvailability.projectId;
    roleAvailability.processId = req.body.processId || roleAvailability.processId;

    const updatedRoleAvailability = await roleAvailability.save();
    res.json(updatedRoleAvailability);
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

// Lösche alle Einträge für ein bestimmtes Projekt
router.delete('/project/:projectId', async (req, res) => {
  try {
    const projectId = req.params.projectId;
    await RoleAvailabilityforCalculation.deleteMany({ projectId });
    res.json({ message: `Alle Einträge für Projekt ${projectId} gelöscht` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;