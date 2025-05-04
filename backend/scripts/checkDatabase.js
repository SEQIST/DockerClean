// scripts/checkDatabase.js
const mongoose = require('mongoose');
const WorkProduct = require('../models/WorkProduct');
const Activity = require('../models/Activity');

mongoose.connect('mongodb://localhost:27017/yourDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Verbunden mit MongoDB');

  // Work Products anzeigen
  console.log('Work Products:');
  const workProducts = await WorkProduct.find();
  console.log(JSON.stringify(workProducts, null, 2));

  // Aktivitäten anzeigen
  console.log('Aktivitäten:');
  const activities = await Activity.find();
  console.log(JSON.stringify(activities, null, 2));

  // Optional: Daten korrigieren
  // await WorkProduct.deleteMany({});
  // await Activity.deleteMany({});
  // await WorkProduct.insertMany([
  //   { _id: 'wp1', name: '001_Ergebnis_1', activities: ['act1', 'act2', 'act3'] },
  //   { _id: 'wp2', name: '001_Ergebnis_2' },
  //   { _id: 'wp3', name: '001_Ergebnis_3' },
  //   { _id: 'wp4', name: '001_Ergebnis_4' },
  // ]);
  // await Activity.insertMany([
  //   { _id: 'act1', name: 'Testaktivität start 2 GF', roles: ['role1'], result: 'wp2', description: 'Beschreibung 1' },
  //   { _id: 'act2', name: 'Aktivität 2 andere rolle2', roles: ['role3'], result: 'wp3', description: 'Beschreibung 2' },
  //   { _id: 'act3', name: 'Testaktivität start 3 GF', roles: ['role1'], result: 'wp4', description: 'Beschreibung 3' },
  // ]);
  // console.log('Daten korrigiert');

  mongoose.connection.close();
}).catch((err) => {
  console.error('Fehler:', err);
});