const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Company = require('../models/Company');

const calculateWorkHoursDayMaxLoad = (obj) => {
  const workdaysWeek = obj.workdaysWeek || 5;
  const avgSickDaysYear = obj.avgSickDaysYear || 10;
  const approvedHolidayDays = obj.approvedHolidayDays || 30;
  const publicHolidaysYear = obj.publicHolidaysYear || 12;
  const workHoursDay = obj.workHoursDay || 8;
  const maxLoad = obj.maxLoad || 85;

  const workdaysYear = (365 / 7) * workdaysWeek - avgSickDaysYear - approvedHolidayDays - publicHolidaysYear;
  const workHoursYear = workdaysYear * workHoursDay;
  const workHoursYearMaxLoad = workHoursYear * (maxLoad / 100);
  return workHoursYearMaxLoad / 365;
};

const serializeSubsidiary = (subsidiary) => {
  subsidiary.workdaysYear = (365 / 7) * (subsidiary.workdaysWeek || 5) - (subsidiary.avgSickDaysYear || 10) - (subsidiary.approvedHolidayDays || 30) - (subsidiary.publicHolidaysYear || 12);
  subsidiary.workHoursYear = subsidiary.workdaysYear * (subsidiary.workHoursDay || 8);
  subsidiary.workHoursYearMaxLoad = subsidiary.workHoursYear * ((subsidiary.maxLoad || 85) / 100);
  subsidiary.workHoursDayMaxLoad = calculateWorkHoursDayMaxLoad(subsidiary);
  if (subsidiary.subsidiaries && Array.isArray(subsidiary.subsidiaries)) {
    subsidiary.subsidiaries = subsidiary.subsidiaries.map(sub => serializeSubsidiary(sub));
  }
  return subsidiary;
};

const serializeCompany = (company) => {
  const companyObj = company.toObject({ virtuals: true });
  companyObj.workdaysYear = (365 / 7) * (companyObj.workdaysWeek || 5) - (companyObj.avgSickDaysYear || 10) - (companyObj.approvedHolidayDays || 30) - (companyObj.publicHolidaysYear || 12);
  companyObj.workHoursYear = companyObj.workdaysYear * (companyObj.workHoursDay || 8);
  companyObj.workHoursYearMaxLoad = companyObj.workHoursYear * ((companyObj.maxLoad || 85) / 100);
  companyObj.workHoursDayMaxLoad = calculateWorkHoursDayMaxLoad(companyObj);
  if (companyObj.subsidiaries && Array.isArray(companyObj.subsidiaries)) {
    companyObj.subsidiaries = companyObj.subsidiaries.map(subsidiary => serializeSubsidiary(subsidiary));
  }
  return companyObj;
};

router.post('/', async (req, res) => {
  try {
    await Company.deleteMany({});
    const company = new Company(req.body);
    await company.save();
    res.status(201).json(serializeCompany(company));
  } catch (error) {
    console.error('Fehler beim Erstellen der Firma:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const company = await Company.findOne();
    if (!company) return res.status(404).json({ error: 'No company found' });
    res.json(serializeCompany(company));
  } catch (error) {
    console.error('Fehler beim Abrufen der Firma:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, workHoursDay, approvedHolidayDays, publicHolidaysYear, avgSickDaysYear, workdaysWeek, maxLoad, subsidiaries } = req.body;

    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ error: 'Company not found' });

    if (!name) throw new Error('Name ist erforderlich');

    company.name = name;
    company.location = location || company.location || '';
    company.workHoursDay = workHoursDay || company.workHoursDay || 8;
    company.approvedHolidayDays = approvedHolidayDays || company.approvedHolidayDays || 30;
    company.publicHolidaysYear = publicHolidaysYear || company.publicHolidaysYear || 12;
    company.avgSickDaysYear = avgSickDaysYear || company.avgSickDaysYear || 10;
    company.workdaysWeek = workdaysWeek || company.workdaysWeek || 5;
    company.maxLoad = maxLoad || company.maxLoad || 85;
    company.subsidiaries = subsidiaries || company.subsidiaries || [];

    await company.save();
    res.json(serializeCompany(company));
  } catch (error) {
    console.error('Fehler beim Bearbeiten der Firma:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/subsidiaries', async (req, res) => {
  try {
    console.log("POST /api/company/subsidiaries - Request Body:", req.body);
    const { name, location, type, companyId, parentId, workHoursDay, approvedHolidayDays, publicHolidaysYear, avgSickDaysYear, workdaysWeek, maxLoad, country, timezone, currency } = req.body;
    if (!name) throw new Error('Name ist erforderlich');
    if (!mongoose.Types.ObjectId.isValid(companyId)) throw new Error('Ungültige companyId');
    const company = await Company.findById(companyId);
    console.log("Found company:", company);
    if (!company) throw new Error('Company not found');

    const newSubsidiary = {
      _id: new mongoose.Types.ObjectId(),
      name,
      location: location || '',
      type: type || 'building',
      isChildOf: parentId || null,
      workHoursDay: workHoursDay || 8,
      approvedHolidayDays: approvedHolidayDays || 30,
      publicHolidaysYear: publicHolidaysYear || 12,
      avgSickDaysYear: avgSickDaysYear || 10,
      workdaysWeek: workdaysWeek || 5,
      maxLoad: maxLoad || 85,
      country: country || '',
      timezone: timezone || '',
      currency: currency || 'EUR',
      subsidiaries: [],
    };

    if (parentId) {
      const findAndUpdateSubsidiary = (subsidiaries, parentId) => {
        for (let sub of subsidiaries) {
          if (sub._id.toString() === parentId) {
            sub.subsidiaries = sub.subsidiaries || [];
            sub.subsidiaries.push(newSubsidiary);
            return true;
          }
          if (sub.subsidiaries && sub.subsidiaries.length > 0) {
            if (findAndUpdateSubsidiary(sub.subsidiaries, parentId)) return true;
          }
        }
        return false;
      };

      const found = findAndUpdateSubsidiary(company.subsidiaries, parentId);
      if (!found) throw new Error('Parent subsidiary not found');
    } else {
      company.subsidiaries.push(newSubsidiary);
    }

    await company.save();
    res.json(serializeSubsidiary(newSubsidiary));
  } catch (error) {
    console.error('Fehler beim Erstellen der Tochtergesellschaft:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/subsidiaries/:id', async (req, res) => {
  try {
    const company = await Company.findOne();
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const findSubsidiary = (subsidiaries, id) => {
      for (let sub of subsidiaries) {
        if (sub._id.toString() === id) return sub;
        if (sub.subsidiaries && sub.subsidiaries.length > 0) {
          const found = findSubsidiary(sub.subsidiaries, id);
          if (found) return found;
        }
      }
      return null;
    };

    const subsidiary = findSubsidiary(company.subsidiaries, req.params.id);
    if (!subsidiary) return res.status(404).json({ error: 'Subsidiary not found' });

    res.json(serializeSubsidiary(subsidiary));
  } catch (error) {
    console.error('Fehler beim Abrufen der Tochtergesellschaft:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/subsidiaries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, type, workHoursDay, approvedHolidayDays, publicHolidaysYear, avgSickDaysYear, workdaysWeek, maxLoad } = req.body;

    const company = await Company.findOne();
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const updateSubsidiary = (subsidiaries, id) => {
      for (let sub of subsidiaries) {
        if (sub._id.toString() === id) {
          sub.name = name || sub.name;
          sub.location = location || sub.location || '';
          sub.type = type || sub.type || 'building';
          sub.workHoursDay = workHoursDay || sub.workHoursDay || 8;
          sub.approvedHolidayDays = approvedHolidayDays || sub.approvedHolidayDays || 30;
          sub.publicHolidaysYear = publicHolidaysYear || sub.publicHolidaysYear || 12;
          sub.avgSickDaysYear = avgSickDaysYear || sub.avgSickDaysYear || 10;
          sub.workdaysWeek = workdaysWeek || sub.workdaysWeek || 5;
          sub.maxLoad = maxLoad || sub.maxLoad || 85;
          return sub;
        }
        if (sub.subsidiaries && sub.subsidiaries.length > 0) {
          const found = updateSubsidiary(sub.subsidiaries, id);
          if (found) return found;
        }
      }
      return null;
    };

    const updatedSubsidiary = updateSubsidiary(company.subsidiaries, id);
    if (!updatedSubsidiary) return res.status(404).json({ error: 'Subsidiary not found' });

    await company.save();
    res.json(serializeSubsidiary(updatedSubsidiary));
  } catch (error) {
    console.error('Fehler beim Bearbeiten der Tochtergesellschaft:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;