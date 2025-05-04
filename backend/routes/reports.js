const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Role = require('../models/Role');
const WorkProduct = require('../models/WorkProduct');

// GET /api/reports/processes - Bereits vorhanden (angenommen)
router.get('/processes', async (req, res) => {
  try {
    // Dieser Endpunkt sollte bereits existieren, wie in deinem vorherigen Code
    const processes = await fetchProcesses(); // Annahme: Diese Funktion existiert
    const report = {
      reportName: "Prozessbericht",
      generatedAt: new Date().toISOString(),
      data: processes,
    };
    res.json(report);
  } catch (error) {
    console.error('Fehler beim Abrufen des Prozessberichts:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Prozessberichts: ' + error.message });
  }
});
// GET /api/reports/workproducts
router.get('/workproducts', async (req, res) => {
  try {
    console.log('Starte Abruf der Work Products für den Bericht...');
    const workProducts = await WorkProduct.find()
      .lean()
      .exec();

    const report = {
      reportName: "Work Products Bericht",
      generatedAt: new Date().toISOString(),
      data: workProducts.map(wp => ({
        ...wp,
        digitalisierbarDurch: wp.digitalisierbarDurch || [],
      })),
    };

    console.log('Work Products Bericht generiert:', report);
    res.json(report);
  } catch (error) {
    console.error('Fehler beim Abrufen des Work Products Berichts:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Work Products Berichts: ' + error.message });
  }
});

// GET /api/reports/activities
router.get('/activities', async (req, res) => {
  try {
    console.log('Starte Abruf der Aktivitäten für den Bericht...');
    const activities = await Activity.find()
      .populate({ path: 'executedBy', strictPopulate: false })
      .populate({ path: 'process', strictPopulate: false })
      .populate({ path: 'result', strictPopulate: false })
      .populate({ path: 'trigger.workProducts._id', strictPopulate: false })
      .populate({ path: 'trigger.determiningFactorId', strictPopulate: false })
      .lean()
      .exec();

    const report = {
      reportName: "Aktivitätsbericht",
      generatedAt: new Date().toISOString(),
      data: activities.map(activity => ({
        ...activity,
        triggerWorkProducts: activity.trigger?.workProducts?.map(wp => wp._id?.name || 'Unbekannt') || [],
        resultWorkProduct: activity.result?.name || null,
      })),
    };

    console.log('Aktivitätsbericht generiert:', report);
    res.json(report);
  } catch (error) {
    console.error('Fehler beim Abrufen des Aktivitätsberichts:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Aktivitätsberichts: ' + error.message });
  }
});

// GET /api/reports/roles
router.get('/roles', async (req, res) => {
  try {
    console.log('Starte Abruf der Rollen für den Bericht...');
    const roles = await Role.find()
      .populate('company')
      .populate('department')
      .populate('supervisorRole')
      .populate('subordinateRoles')
      .lean()
      .exec();

    const report = {
      reportName: "Rollenbericht",
      generatedAt: new Date().toISOString(),
      data: roles.map(role => ({
        ...role,
        activities: role.activities || [], // Stelle sicher, dass activities definiert ist
      })),
    };

    console.log('Rollenbericht generiert:', report);
    res.json(report);
  } catch (error) {
    console.error('Fehler beim Abrufen des Rollenberichts:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Rollenberichts: ' + error.message });
  }
});

module.exports = router;