// routes/engineeringRoutes.js
const express = require('express');
const router = express.Router();
const EngineeringStandard = require('../models/engineeringStandard');
const EngineeringContent = require('../models/engineeringContent');
const SystemRequirement = require('../models/SystemRequirement');
const { parseStringPromise } = require('xml2js');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/engineering/parse-reqif - Parse REQIF-Datei
router.post('/parse-reqif', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen.' });
    }

    const fileContent = req.file.buffer.toString('utf8');
    const result = await parseStringPromise(fileContent);

    const parsedData = result['REQ-IF']?.['CORE-CONTENT']?.['SPEC-OBJECTS']?.[0]?.['SPEC-OBJECT']?.map(obj => ({
      id: obj['IDENTIFIER']?.[0],
      text: obj['VALUES']?.[0]?.['ATTRIBUTE-VALUE-XHTML']?.[0]?.['THE-VALUE']?.[0] || 'Unbekannt',
    })) || [];

    res.status(200).json(parsedData);
  } catch (error) {
    console.error('Fehler beim Parsen der REQIF-Datei:', error);
    res.status(500).json({ error: 'Fehler beim Parsen der REQIF-Datei: ' + error.message });
  }
});

// GET /api/engineering/standards - Hole alle Engineering-Standards
router.get('/standards', async (req, res) => {
  try {
    const standards = await EngineeringStandard.find();
    res.json(standards);
  } catch (error) {
    console.error('Fehler beim Abrufen der Engineering-Standards:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Engineering-Standards' });
  }
});

// GET /api/engineering/standards/:id - Hole ein spezifisches Engineering-Standard
router.get('/standards/:id', async (req, res) => {
  try {
    const standard = await EngineeringStandard.findById(req.params.id);
    if (!standard) return res.status(404).json({ error: 'Engineering-Standard nicht gefunden' });
    res.json(standard);
  } catch (error) {
    console.error('Fehler beim Abrufen des Engineering-Standards:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/engineering/standards - Erstelle ein neues Engineering-Standard
router.post('/standards', async (req, res) => {
  try {
    const standard = new EngineeringStandard(req.body);
    const savedStandard = await standard.save();
    res.status(201).json(savedStandard);
  } catch (error) {
    console.error('Fehler beim Erstellen des Engineering-Standards:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/engineering/standards/:id - Lösche ein Engineering-Standard
router.delete('/standards/:id', async (req, res) => {
  try {
    const standard = await EngineeringStandard.findByIdAndDelete(req.params.id);
    if (!standard) return res.status(404).json({ error: 'Engineering-Standard nicht gefunden' });
    res.json({ message: 'Engineering-Standard gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Engineering-Standards:', error);
    res.status(400).json({ error: error.message });
  }
});

// GET /api/engineering/content - Hole alle Engineering-Inhaltselemente (optional gefiltert)
router.get('/content', async (req, res) => {
  try {
    const query = req.query.engineeringStandard ? { engineeringStandard: req.query.engineeringStandard } : {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const contents = await EngineeringContent.find(query)
      .skip(skip)
      .limit(limit)
      .populate('engineeringStandard');
    res.json(contents);
  } catch (error) {
    console.error('Fehler beim Abrufen der Engineering-Inhaltselemente:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Engineering-Inhaltselemente' });
  }
});

// POST /api/engineering/content - Erstelle ein neues Engineering-Inhaltselement
router.post('/content', async (req, res) => {
  try {
    const content = new EngineeringContent(req.body);
    const savedContent = await content.save();
    await savedContent.populate('engineeringStandard');
    res.status(201).json(savedContent);
  } catch (error) {
    console.error('Fehler beim Erstellen des Engineering-Inhaltselements:', error);
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/engineering/content/:id - Lösche ein Engineering-Inhaltselement
router.delete('/content/:id', async (req, res) => {
  try {
    const content = await EngineeringContent.findByIdAndDelete(req.params.id);
    if (!content) return res.status(404).json({ error: 'Engineering-Inhaltselement nicht gefunden' });
    res.json({ message: 'Engineering-Inhaltselement gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Engineering-Inhaltselements:', error);
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/engineering/content/:id - Aktualisiere ein Engineering-Inhaltselement
router.put('/content/:id', async (req, res) => {
  try {
    const content = await EngineeringContent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('engineeringStandard');
    if (!content) return res.status(404).json({ error: 'Engineering-Inhaltselement nicht gefunden' });
    res.json(content);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Engineering-Inhaltselements:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/engineering/import - Importiere bearbeitete Daten
router.post('/import', async (req, res) => {
  try {
    const { projectId, importType, groups, ungrouped } = req.body;

    let requirements = [];

    // Standard für EngineeringContent (optional, falls keiner existiert, erstelle einen Dummy)
    let defaultStandard = await EngineeringStandard.findOne();
    if (!defaultStandard) {
      defaultStandard = new EngineeringStandard({
        name: 'Default Standard',
        description: 'Automatisch erstellt für Import',
        source: 'System',
      });
      await defaultStandard.save();
    }

    // Verarbeite Gruppen
    for (const group of groups) {
      for (const req of group.requirements) {
        if (importType === 'customerRequirements') {
          const content = new EngineeringContent({
            engineeringStandard: defaultStandard._id,
            text: req.text,
            type: req.type,
          });
          await content.save();
          requirements.push({
            id: content._id,
            text: req.text,
            type: req.type,
          });
        } else if (importType === 'systemRequirements') {
          const systemReq = new SystemRequirement({
            projectId,
            header: group.name || '',
            text: req.text,
            parentId: null,
            traces: { customerRequirementId: null }, // Kann später verknüpft werden
          });
          await systemReq.save();
          requirements.push({
            id: systemReq._id,
            text: req.text,
            type: req.type,
          });
        }
      }
    }

    // Verarbeite ungruppierte Elemente
    for (const req of ungrouped) {
      if (importType === 'customerRequirements') {
        const content = new EngineeringContent({
          engineeringStandard: defaultStandard._id,
          text: req.text,
          type: req.type,
        });
        await content.save();
        requirements.push({
          id: content._id,
          text: req.text,
          type: req.type,
        });
      } else if (importType === 'systemRequirements') {
        const systemReq = new SystemRequirement({
          projectId,
          header: '',
          text: req.text,
          parentId: null,
          traces: { customerRequirementId: null },
        });
        await systemReq.save();
        requirements.push({
          id: systemReq._id,
          text: req.text,
          type: req.type,
        });
      }
    }

    res.status(201).json({ requirements });
  } catch (error) {
    console.error('Fehler beim Import:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;