const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Role = require('../models/Role');

router.post('/', async (req, res) => {
  try {
    const { name, description, isJuniorTo, headOfDepartment } = req.body;

    // Validierung
    if (!name) {
      return res.status(400).json({ message: 'Name ist erforderlich' });
    }

    // Überprüfe, ob isJuniorTo existiert (falls angegeben)
    if (isJuniorTo) {
      const parentDept = await Department.findById(isJuniorTo);
      if (!parentDept) {
        return res.status(400).json({ message: 'Übergeordnete Abteilung existiert nicht' });
      }
    }

    // Überprüfe, ob headOfDepartment existiert (falls angegeben)
    if (headOfDepartment) {
      const role = await Role.findById(headOfDepartment);
      if (!role) {
        return res.status(400).json({ message: 'Abteilungsleitung existiert nicht' });
      }
    }

    // Erstelle neue Abteilung
    const newDepartment = new Department({
      name,
      description: description || '',
      isJuniorTo: isJuniorTo || null,
      headOfDepartment: headOfDepartment || null,
    });

    const savedDepartment = await newDepartment.save();
    res.status(201).json(savedDepartment);
  } catch (error) {
    console.error('Fehler beim Speichern der Abteilung:', error);
    res.status(400).json({ message: error.message || 'Fehler beim Speichern der Abteilung' });
  }
});

router.get('/', async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('isJuniorTo')
      .populate('headOfDepartment');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, isJuniorTo, headOfDepartment } = req.body;

    // Validierung
    if (!name) {
      return res.status(400).json({ message: 'Name ist erforderlich' });
    }

    // Überprüfe, ob isJuniorTo existiert (falls angegeben)
    if (isJuniorTo) {
      const parentDept = await Department.findById(isJuniorTo);
      if (!parentDept) {
        return res.status(400).json({ message: 'Übergeordnete Abteilung existiert nicht' });
      }
    }

    // Überprüfe, ob headOfDepartment existiert (falls angegeben)
    if (headOfDepartment) {
      const role = await Role.findById(headOfDepartment);
      if (!role) {
        return res.status(400).json({ message: 'Abteilungsleitung existiert nicht' });
      }
    }

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description, isJuniorTo, headOfDepartment },
      { new: true }
    )
      .populate('isJuniorTo')
      .populate('headOfDepartment');
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;