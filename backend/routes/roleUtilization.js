const express = require('express');
const router = express.Router();
const RoleUtilization = require('../models/RoleUtilization');

// Hole alle Einträge für eine Rolle
router.get('/:roleId', async (req, res) => {
  try {
    const roleId = req.params.roleId;
    const utilization = await RoleUtilization.find({ roleId });
    res.json(utilization);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Füge einen neuen Eintrag hinzu
router.post('/', async (req, res) => {
  const roleUtilization = new RoleUtilization({
    roleId: req.body.roleId,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    utilizedHours: req.body.utilizedHours,
    activityId: req.body.activityId,
    projectId: req.body.projectId || null,
    processId: req.body.processId || null,
  });

  try {
    const newRoleUtilization = await roleUtilization.save();
    res.status(201).json(newRoleUtilization);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Lösche alle Einträge (für Testzwecke)
router.delete('/', async (req, res) => {
  try {
    await RoleUtilization.deleteMany({});
    res.json({ message: 'Alle Einträge gelöscht' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;