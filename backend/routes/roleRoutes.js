const express = require('express');
const router = express.Router();
const Role = require('../models/Role');
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

const serializeRole = async (role) => {
  const roleObj = role.toObject({ virtuals: true });
  if (roleObj.subsidiary) {
    // Finde die Firma und suche den Standort in company.subsidiaries
    const company = await Company.findOne({ _id: roleObj.company });
    if (company) {
      const findSubsidiary = (subsidiaries, id) => {
        for (let sub of subsidiaries) {
          if (sub._id.toString() === id.toString()) {
            sub.workdaysYear = (365 / 7) * (sub.workdaysWeek || 5) - (sub.avgSickDaysYear || 10) - (sub.approvedHolidayDays || 30) - (sub.publicHolidaysYear || 12);
            sub.workHoursYear = sub.workdaysYear * (sub.workHoursDay || 8);
            sub.workHoursYearMaxLoad = sub.workHoursYear * ((sub.maxLoad || 85) / 100);
            sub.workHoursDayMaxLoad = calculateWorkHoursDayMaxLoad(sub);
            if (sub.subsidiaries && sub.subsidiaries.length > 0) {
              sub.subsidiaries = sub.subsidiaries.map(subSub => findSubsidiary([subSub], subSub._id) || subSub);
            }
            return sub;
          }
          if (sub.subsidiaries && sub.subsidiaries.length > 0) {
            const found = findSubsidiary(sub.subsidiaries, id);
            if (found) return found;
          }
        }
        return null;
      };
      const subsidiary = findSubsidiary(company.subsidiaries, roleObj.subsidiary);
      roleObj.subsidiary = subsidiary || null;
    }
  }
  if (roleObj.company) {
    const company = roleObj.company;
    company.workdaysYear = (365 / 7) * (company.workdaysWeek || 5) - (company.avgSickDaysYear || 10) - (company.approvedHolidayDays || 30) - (company.publicHolidaysYear || 12);
    company.workHoursYear = company.workdaysYear * (company.workHoursDay || 8);
    company.workHoursYearMaxLoad = company.workHoursYear * ((company.maxLoad || 85) / 100);
    company.workHoursDayMaxLoad = calculateWorkHoursDayMaxLoad(company);
  }
  return roleObj;
};

const serializeRoles = async (roles) => {
  return await Promise.all(roles.map(role => serializeRole(role)));
};

router.post('/', async (req, res) => {
  try {
    const role = new Role(req.body);
    const savedRole = await role.save();
    res.status(201).json(await serializeRole(savedRole));
  } catch (error) {
    console.error('Fehler beim Erstellen der Rolle:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validierungsfehler: ' + Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const roles = await Role.find()
      .populate('company')
      .populate('department')
      .populate('supervisorRole')
      .populate('subordinateRoles');
    res.json(await serializeRoles(roles));
  } catch (error) {
    console.error('Fehler beim Abrufen der Rollen:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('company')
      .populate('department')
      .populate('supervisorRole')
      .populate('subordinateRoles');
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json(await serializeRole(role));
  } catch (error) {
    console.error('Fehler beim Bearbeiten der Rolle:', error);
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json({ message: 'Role deleted' });
  } catch (error) {
    console.error('Fehler beim Löschen der Rolle:', error);
    res.status(400).json({ error: error.message });
  }
});

router.patch('/:id/dailyWorkload', async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, { dailyWorkload: null }, { new: true })
      .populate('company')
      .populate('department')
      .populate('supervisorRole')
      .populate('subordinateRoles');
    if (!role) return res.status(404).json({ error: 'Role not found' });
    res.json(await serializeRole(role));
  } catch (error) {
    console.error('Fehler beim Zurücksetzen der Arbeitslast:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/import', async (req, res) => {
  try {
    const rolesData = req.body;
    if (!Array.isArray(rolesData)) {
      return res.status(400).json({ error: 'Erwartet ein Array von Rollen' });
    }

    const importedRoles = [];
    for (const roleData of rolesData) {
      const role = new Role(roleData);
      const savedRole = await role.save();
      importedRoles.push(await serializeRole(savedRole));
    }

    res.status(201).json(importedRoles);
  } catch (error) {
    console.error('Fehler beim Importieren der Rollen:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;