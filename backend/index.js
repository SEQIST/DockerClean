const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const winston = require('winston');
const engineeringRoutes = require('./routes/engineeringRoutes');
const companyRoutes = require('./routes/companyRouter');
const departmentRoutes = require('./routes/departmentRoutes');
const roleRoutes = require('./routes/roleRoutes');
const recurringTaskRoutes = require('./routes/recurringTaskRoutes');
const workProductRoutes = require('./routes/workProductRoutes');
const activityRoutes = require('./routes/activityRoutes');
const processRoutes = require('./routes/processRoutes');
const regulatoryISORoutes = require('./routes/regulatoryISORoutes');
const regulatoryContentRoutes = require('./routes/regulatoryContentRoutes');
const regulatoryEvaluationRoutes = require('./routes/regulatoryEvaluationRoutes');
const fileUploadRoutes = require('./routes/fileUploadRoutes');
const roleAvailabilityRoutes = require('./routes/roleAvailability');
const activityScheduleRoutes = require('./routes/activitySchedule');
const roleUtilizationRoutes = require('./routes/roleUtilization');
const roleAvailabilityforCalculationRoutes = require('./routes/roleAvailabilityforCalculation');
const projectRoutes = require('./routes/projectRoutes');
const releaseRoutes = require('./routes/releaseRoutes');
const customerRoutes = require('./routes/customerRoutes');
const eventRoutes = require('./routes/events');
const riskMatrixRoutes = require('./routes/riskMatrix');
const riskCategoriesRoutes = require('./routes/riskCategories');
const riskStrategiesRoutes = require('./routes/riskStrategies');
const reportsRouter = require('./routes/reports');

const app = express();

// Konfiguriere Logging mit Winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "server.log" }),
    new winston.transports.Console(),
  ],
});

// Ersetze console.log durch logger
console.log = (...args) => logger.info.call(logger, ...args);
console.error = (...args) => logger.error.call(logger, ...args);

app.use(express.json());
app.use(cors());

mongoose.set('strictQuery', true);

// MongoDB-Verbindung mit Retry-Mechanismus
const connectWithRetry = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/seq_dev');
    logger.info('Verbunden mit MongoDB');
  } catch (err) {
    logger.error('MongoDB-Verbindungsfehler:', err);
    logger.info('Versuche erneut in 5 Sekunden...');
    setTimeout(connectWithRetry, 5000); // Retry nach 5 Sekunden
  }
};

connectWithRetry();

// Routen
app.use('/api/engineering', engineeringRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/recurringTasks', recurringTaskRoutes);
app.use('/api/workproducts', workProductRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/reports', reportsRouter);
app.use('/api/regulatory-isos', regulatoryISORoutes);
app.use('/api/regulatory-content', regulatoryContentRoutes);
app.use('/api/regulatory-evaluations', regulatoryEvaluationRoutes);
app.use('/api/upload', fileUploadRoutes);
app.use('/api/roleAvailability', roleAvailabilityRoutes);
app.use('/api/activitySchedule', activityScheduleRoutes);
app.use('/api/roleUtilization', roleUtilizationRoutes);
app.use('/api/roleAvailabilityforCalculation', roleAvailabilityforCalculationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/releases', releaseRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/riskmatrix', riskMatrixRoutes);
app.use('/api/riskcategories', riskCategoriesRoutes);
app.use('/api/riskstrategies', riskStrategiesRoutes);

// Globaler Fehlerhandler für ungültige Routen
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route nicht gefunden' });
});

// Globaler Fehlerhandler für unerwartete Fehler
app.use((err, req, res, next) => {
  logger.error('Unerwarteter Fehler:', err);
  res.status(500).json({ error: 'Ein unerwarteter Fehler ist aufgetreten' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => logger.info(`Server läuft auf Port ${PORT}`));