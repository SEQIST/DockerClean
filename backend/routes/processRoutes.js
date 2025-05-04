const express = require('express');
const router = express.Router();
const Process = require('../models/Process');

router.post('/', async (req, res) => {
  try {
    const process = new Process(req.body);
    await process.save();
    res.status(201).json(process);
  } catch (error) {
    console.error('Fehler beim Erstellen des Prozesses:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    console.log('Starte Abruf der Prozesse...');
    const { workProductId } = req.query;
    let query = {};

    if (workProductId) {
      query = {
        $or: [
          { result: workProductId },
          { 'trigger.workProducts._id': workProductId },
        ],
      };
    }

    const processes = await Process.find(query).exec();
    console.log('Prozesse vor Populate:', processes);

    const populatedProcesses = await Process.populate(processes, [
      { path: 'owner', strictPopulate: false },
      { path: 'isChildOf', strictPopulate: false },
      { path: 'workProducts.workProductId', strictPopulate: false },
    ]).catch(err => {
      console.error('Fehler beim Populieren der Prozesse:', err);
      return processes;
    });

    console.log('Prozesse nach Populate:', populatedProcesses);
    res.json(populatedProcesses);
  } catch (error) {
    console.error('Fehler beim Abrufen der Prozesse:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const process = await Process.findById(req.params.id).exec();
    if (!process) return res.status(404).json({ error: 'Process not found' });

    console.log('Prozess vor Populate:', process);
    const populatedProcess = await Process.populate(process, [
      { path: 'owner', strictPopulate: false },
      { path: 'isChildOf', strictPopulate: false },
      { path: 'workProducts.workProductId', strictPopulate: false },
    ]).catch(err => {
      console.error('Fehler beim Populieren des Prozesses:', err);
      return process;
    });

    console.log('Prozess nach Populate:', populatedProcess);
    res.json(populatedProcess);
  } catch (error) {
    console.error('Fehler beim Abrufen des Prozesses:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log('PUT request body:', req.body);
    const process = await Process.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!process) return res.status(404).json({ error: 'Process not found' });
    console.log('Updated process:', process);
    res.json(process);
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Prozesses:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const process = await Process.findByIdAndDelete(req.params.id);
    if (!process) return res.status(404).json({ error: 'Process not found' });
    res.json({ message: 'Process deleted' });
  } catch (error) {
    console.error('Fehler beim Löschen des Prozesses:', error);
    res.status(400).json({ error: error.message });
  }
});

// Routen für BPMN-Positionen
router.get('/:id/bpmn-positions', async (req, res) => {
  try {
    const process = await Process.findById(req.params.id);
    if (!process) return res.status(404).json({ error: 'Prozess nicht gefunden' });
    const positions = Object.fromEntries(process.bpmnPositions) || {};
    const edges = Object.fromEntries(process.bpmnEdges) || {};
    const laneDimensions = Object.fromEntries(process.bpmnLaneDimensions) || {};
    // Kombiniere Positionen, Kanten und Lane-Dimensionen für das Frontend
    const combinedPositions = { ...positions, ...edges, ...laneDimensions };
    res.json({ positions: combinedPositions });
  } catch (error) {
    console.error('Fehler beim Abrufen der BPMN-Positionen:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/bpmn-positions', async (req, res) => {
  try {
    const { positions } = req.body;
    console.log('Empfangene BPMN-Daten:', positions);
    const process = await Process.findById(req.params.id);
    if (!process) {
      console.error('Prozess nicht gefunden für ID:', req.params.id);
      return res.status(404).json({ error: 'Prozess nicht gefunden' });
    }
//    console.log('Aktuelle BPMN-Positionen vor Update:', process.bpmnPositions);
 //   console.log('Aktuelle BPMN-Edges vor Update:', process.bpmnEdges);
//    console.log('Aktuelle BPMN-Lane-Dimensionen vor Update:', process.bpmnLaneDimensions);

    // Trenne Positionen, Kanten und Lane-Dimensionen
    const newPositions = new Map();
    const newEdges = new Map();
    const newLaneDimensions = new Map();
    for (const [key, value] of Object.entries(positions || {})) {
      if (key === 'undefined') {
        console.warn('Ungültiger Schlüssel "undefined" in positions gefunden, wird ignoriert.');
        continue;
      }
      if (key.startsWith('e')) {
        newEdges.set(key, value);
      } else if (key.startsWith('swimlane-') && value && typeof value === 'object' && 'width' in value && 'height' in value) {
        newLaneDimensions.set(key, { width: value.width, height: value.height });
      } else if (value && typeof value === 'object' && 'x' in value && 'y' in value) {
        newPositions.set(key, { x: value.x, y: value.y });
      }
    }

    process.bpmnPositions = newPositions;
    process.bpmnEdges = newEdges;
    process.bpmnLaneDimensions = newLaneDimensions;
    await process.save();
 //   console.log('Gespeicherte BPMN-Positionen:', process.bpmnPositions);
 //   console.log('Gespeicherte BPMN-Edges:', process.bpmnEdges);
 //   console.log('Gespeicherte BPMN-Lane-Dimensionen:', process.bpmnLaneDimensions);
    res.json({ message: 'Positionen, Kanten und Dimensionen erfolgreich gespeichert' });
  } catch (error) {
 //   console.error('Fehler beim Speichern der BPMN-Positionen:', error.stack);
    res.status(500).json({ error: error.message });
  }
});


// Bulk-Import Route
router.post('/bulk', async (req, res) => {
  try {
    const processesData = req.body; // Erwartet ein Array von Prozessen
    if (!Array.isArray(processesData)) {
      return res.status(400).json({ error: 'Erwartet ein Array von Prozessen' });
    }

    const savedProcesses = [];
    const errors = [];

    // Iteriere über jedes Prozesselement und speichere es
    for (const processData of processesData) {
      try {
        const process = new Process(processData);
        const savedProcess = await process.save();
        savedProcesses.push(savedProcess);
      } catch (error) {
        console.error(`Fehler beim Speichern des Prozesses: ${JSON.stringify(processData)}`, error);
        errors.push({ processData, error: error.message });
      }
    }

    // Antwort mit erfolgreich gespeicherten Prozessen und Fehlern (falls vorhanden)
    res.status(201).json({
      message: `Erfolgreich ${savedProcesses.length} Prozesse gespeichert`,
      savedProcesses,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Fehler beim Bulk-Import von Prozessen:', error);
    res.status(500).json({ error: error.message });
  }
});

// Neue Routen für Flow-Positionen
router.get('/:id/flow-positions', async (req, res) => {
  try {
    const process = await Process.findById(req.params.id);
    if (!process) return res.status(404).json({ error: 'Prozess nicht gefunden' });
    res.json({ positions: Object.fromEntries(process.flowPositions) || {} });
  } catch (error) {
    console.error('Fehler beim Abrufen der Flow-Positionen:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/flow-positions', async (req, res) => {
  try {
    const { positions } = req.body;
    console.log('Empfangene Flow-Positionen:', positions);
    const process = await Process.findById(req.params.id);
    if (!process) {
      console.error('Prozess nicht gefunden für ID:', req.params.id);
      return res.status(404).json({ error: 'Prozess nicht gefunden' });
    }
    console.log('Aktuelle Flow-Positionen vor Update:', process.flowPositions);
    // Konvertiere positions in eine Map
    const updatedPositions = new Map(Object.entries(positions));
    process.flowPositions = updatedPositions;
    await process.save();
    console.log('Gespeicherte Flow-Positionen:', process.flowPositions);
    res.json({ message: 'Flow-Positionen erfolgreich gespeichert' });
  } catch (error) {
    console.error('Fehler beim Speichern der Flow-Positionen:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;