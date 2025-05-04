// backend/routes/riskCategories.js
const express = require('express');
const router = express.Router();
const RiskCategory = require('../models/RiskCategory');

router.get('/', async (req, res) => {
  const categories = await RiskCategory.find();
  res.json(categories);
});

router.post('/', async (req, res) => {
  const category = new RiskCategory(req.body);
  const newCategory = await category.save();
  res.status(201).json(newCategory);
});

router.put('/:id', async (req, res) => {
  const category = await RiskCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) return res.status(404).json({ error: 'Kategorie nicht gefunden' });
  res.json(category);
});

router.delete('/:id', async (req, res) => {
  const category = await RiskCategory.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ error: 'Kategorie nicht gefunden' });
  res.json({ message: 'Kategorie gelöscht' });
});

module.exports = router;