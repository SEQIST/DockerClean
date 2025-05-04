// backend/scripts/fixDatabase.js
const mongoose = require('mongoose');
const WorkProduct = require('../models/WorkProduct'); // Passe den Pfad an
const Activity = require('../models/Activity'); // Passe den Pfad an

mongoose.connect('mongodb://localhost:27017/yourDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('Verbunden mit MongoDB');

  // Bestehende Daten löschen
  await WorkProduct.deleteMany({});
  await Activity.deleteMany({});

  // Neue Work Products einfügen
  const workProducts = await WorkProduct.insertMany([
    { _id: new mongoose.Types.ObjectId(), name: '001_Ergebnis_1', activities: [] },
    { _id: new mongoose.Types.ObjectId(), name: '001_Ergebnis_2' },
    { _id: new mongoose.Types.ObjectId(), name: '001_Ergebnis_3' },
    { _id: new mongoose.Types.ObjectId(), name: '001_Ergebnis_4' },
  ]);

  // Aktivitäten einfügen
  await Activity.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      name: 'Testaktivität start 2 GF',
      roles: ['role1'],
      result: workProducts[1]._id, // Verknüpft mit 001_Ergebnis_2
      description: 'Beschreibung 1',
    },
    {
      _id: new mongoose.Types.ObjectId(),
      name: 'Aktivität 2 andere rolle2',
      roles: ['role3'],
      result: workProducts[2]._id, // Verknüpft mit 001_Ergebnis_3
      description: 'Beschreibung 2',
    },
    {
      _id: new mongoose.Types.ObjectId(),
      name: 'Testaktivität start 3 GF',
      roles: ['role1'],
      result: workProducts[3]._id, // Verknüpft mit 001_Ergebnis_4
      description: 'Beschreibung 3',
    },
  ]);

  // Work Product 1 mit Aktivitäten verknüpfen
  await WorkProduct.findByIdAndUpdate(workProducts[0]._id, {
    activities: [
      activities[0]._id,
      activities[1]._id,
      activities[2]._id,
    ],
  });

  console.log('Daten erfolgreich korrigiert');

  // Daten anzeigen
  console.log('Work Products:');
  const updatedWorkProducts = await WorkProduct.find();
  console.log(JSON.stringify(updatedWorkProducts, null, 2));

  console.log('Aktivitäten:');
  const updatedActivities = await Activity.find();
  console.log(JSON.stringify(updatedActivities, null, 2));

  mongoose.connection.close();
}).catch((err) => {
  console.error('Fehler:', err);
});