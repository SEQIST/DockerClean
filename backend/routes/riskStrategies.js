// backend/routes/riskStrategies.js
const express = require('express');
const router = express.Router();
const RiskStrategy = require('../models/RiskStrategy');

router.get('/', async (req, res) => {
  const strategies = await RiskStrategy.find();
  res.json(strategies);
});

router.post('/', async (req, res) => {
  const strategy = new RiskStrategy(req.body);
  const newStrategy = await strategy.save();
  res.status(201).json(newStrategy);
});

module.exports = router;