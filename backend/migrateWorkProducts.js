const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yourDatabase', { useNewUrlParser: true, useUnifiedTopology: true });

const WorkProduct = require('./models/WorkProduct');

const migrate = async () => {
  try {
    await WorkProduct.updateMany(
      { digitalisierbarDurch: { $exists: false } },
      { $set: { digitalisierbarDurch: [] } }
    );
    console.log('Migration abgeschlossen');
  } catch (error) {
    console.error('Fehler bei der Migration:', error);
  } finally {
    mongoose.connection.close();
  }
};

migrate();