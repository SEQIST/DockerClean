// backend/seedRisks.js
const mongoose = require('mongoose');
const Risk = require('./models/Risk');

mongoose.connect('mongodb://localhost:27017/seq_dev', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const riskData = [
  {
    category: 'Technologische Risiken',
    status: 'In Progress',
    title: 'Incorrect code and implementation',
    submitter: 'Thomas Arends',
    description: 'is a Risk resultion out of Software development on module level. Not tested, Reviewed etc..',
    mitigation: 'Develop and implement Processes. Ensure Processes kept in & optimized. Testing a 100% on relevant items',
    likelihoodBefore: 4,
    severityBeforeEstimated: 4,
    severityBeforeCalculated: 3,
    likelihoodAfter: 2,
    severityAfterEstimated: 2,
    severityAfterCalculated: 2,
  },
  {
    category: 'Technologische Risiken',
    status: 'In Progress',
    title: 'Person Hours',
    submitter: 'Thomas Arends',
    description: 'Overexceeding 16000 - can not be divided into smaller scope - too many influencing factors',
    mitigation: 'Planning and control',
    likelihoodBefore: 4,
    severityBeforeEstimated: 3,
    severityBeforeCalculated: 3,
    likelihoodAfter: 3,
    severityAfterEstimated: 3,
    severityAfterCalculated: 3,
  },
  // Weitere Risiken können hier hinzugefügt werden
];

const seedRisks = async () => {
  await Risk.deleteMany({});
  await Risk.insertMany(riskData);
  console.log('Risikodaten erfolgreich eingefügt');
  mongoose.connection.close();
};

seedRisks();