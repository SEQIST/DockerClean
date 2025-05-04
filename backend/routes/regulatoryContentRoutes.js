const express = require('express');
const router = express.Router();
const RegulatoryContent = require('../models/RegulatoryContent');

// GET all regulatory contents or filter by regulatoryISO with pagination
router.get('/', async (req, res) => {
  try {
    const { regulatoryISO, page = 1, limit = 20 } = req.query;
    let query = {};

    if (regulatoryISO) {
      query.regulatoryISO = regulatoryISO;
    }

    const contents = await RegulatoryContent.find(query)
      .populate('regulatoryISO')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    console.log('Regulatory Contents:', contents);
    res.json(contents);
  } catch (error) {
    console.error('Error fetching regulatory contents:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST a new regulatory content
router.post('/', async (req, res) => {
  try {
    const content = new RegulatoryContent(req.body);
    const savedContent = await content.save();
    const populatedContent = await RegulatoryContent.findById(savedContent._id).populate('regulatoryISO');
    res.status(201).json(populatedContent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT (update) an existing regulatory content by ID
router.put('/:id', async (req, res) => {
  try {
    const content = await RegulatoryContent.findById(req.params.id);
    if (!content) {
      console.log(`Content with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Content not found' });
    }

    Object.assign(content, req.body);
    const updatedContent = await content.save();
    const populatedContent = await RegulatoryContent.findById(updatedContent._id).populate('regulatoryISO');
    console.log('Updated Content:', populatedContent);
    res.json(populatedContent);
  } catch (error) {
    console.error('Error in PUT /api/regulatory-content/:id:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE a regulatory content by ID
router.delete('/:id', async (req, res) => {
  try {
    const content = await RegulatoryContent.findByIdAndDelete(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;