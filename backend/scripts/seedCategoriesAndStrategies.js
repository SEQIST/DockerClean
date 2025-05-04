// backend/seedCategoriesAndStrategies.js
const mongoose = require('mongoose');
const RiskCategory = require('../models/RiskCategory');
const RiskStrategy = require('../models/RiskStrategy');

mongoose.connect('mongodb://localhost:27017/seq_dev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const categories = [
  { name: 'Technologische Risiken', description: 'Risiken im Zusammenhang mit Technologie' },
  { name: 'GobD', description: 'Risiken im Zusammenhang mit GoBD' },
];

const strategies = [
  { name: 'Accept', description: 'Übernahme des Risikos' },
  { name: 'Transfer', description: 'Transfer des Risikos' },
  { name: 'Avoid', description: 'Vermeidung des Risikos' },
  { name: 'Reduce', description: 'Reduktion des Risikos' },
];

const seedData = async () => {
  await RiskCategory.deleteMany({});
  await RiskCategory.insertMany(categories);
  await RiskStrategy.deleteMany({});
  await RiskStrategy.insertMany(strategies);
  console.log('Daten erfolgreich eingefügt');
  mongoose.connection.close();
};

seedData();