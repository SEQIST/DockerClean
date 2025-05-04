const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Release = require('../models/Release');
const WorkProduct = require('../models/WorkProduct');

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    res.status(500).json({ message: 'Fehler beim Abrufen der Projekte' });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projekt nicht gefunden' });

    const workProducts = await WorkProduct.find();

    // Wir laden die releases direkt aus dem project-Dokument, nicht aus einer separaten Collection
    const releases = project.releases || [];

    res.json({ project, releases, workProducts });
  } catch (error) {
    console.error('Error fetching project:', error.message);
    res.status(500).json({ message: 'Fehler beim Abrufen des Projekts', error: error.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    console.log('Empfangene Daten für neues Projekt:', req.body);
    const project = new Project(req.body);
    const savedProject = await project.save();
    console.log('Gespeichertes Projekt:', savedProject);
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Fehler beim Erstellen des Projekts:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    console.log('Empfangene Daten für Update Projekt:', req.body);
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Projekt nicht gefunden' });

    project.name = req.body.name || project.name;
    project.customer = req.body.customer || project.customer;
    project.plannedStartDate = req.body.plannedStartDate || project.plannedStartDate;
    project.plannedEndDate = req.body.plannedEndDate || project.plannedEndDate;
    project.plannedBudget = req.body.plannedBudget || project.plannedBudget;
    project.resourcesSummary = req.body.resourcesSummary || project.resourcesSummary;
    project.calculatedCost = req.body.calculatedCost || project.calculatedCost;

    const currentWorkProducts = (project.workProducts || []).map(wp => {
      if (mongoose.Types.ObjectId.isValid(wp)) {
        return { workProduct: wp, knownItems: 0, unknownItems: 0 };
      }
      return wp;
    });

    if (req.body.workProducts) {
      const newWorkProducts = req.body.workProducts.map(wp => {
        if (typeof wp === 'string') {
          return { workProduct: wp, knownItems: 0, unknownItems: 0 };
        }
        return {
          workProduct: wp.workProduct,
          knownItems: Number(wp.knownItems) || 0,
          unknownItems: Number(wp.unknownItems) || 0,
        };
      });
      console.log('Neue Work Products vor dem Speichern:', newWorkProducts);
      // Validierung der workProduct IDs
      for (const wp of newWorkProducts) {
        if (!mongoose.Types.ObjectId.isValid(wp.workProduct)) {
          return res.status(400).json({ error: `Ungültige workProduct ID: ${wp.workProduct}` });
        }
      }
      project.workProducts = newWorkProducts;
    } else {
      project.workProducts = currentWorkProducts;
    }

    // Releases speichern
    if (req.body.releases) {
      const newReleases = req.body.releases.map(release => ({
        name: release.name,
        startDate: release.startDate,
        endDate: release.endDate,
        workProducts: release.workProducts ? release.workProducts.map(wp => ({
          workProduct: wp.workProduct,
          knownItems: Number(wp.knownItems) || 0,
          unknownItems: Number(wp.unknownItems) || 0,
        })) : [],
      }));
      console.log('Neue Releases vor dem Speichern:', newReleases);
      project.releases = newReleases;
    }

    const updatedProject = await project.save();
    console.log('Aktualisiertes Projekt in der Datenbank:', updatedProject);
    res.json(updatedProject);
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Projekts:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Projekt nicht gefunden' });
    res.json({ message: 'Projekt gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Projekts:', error);
    res.status(500).json({ error: 'Interner Serverfehler: ' + error.message });
  }
});

module.exports = router;