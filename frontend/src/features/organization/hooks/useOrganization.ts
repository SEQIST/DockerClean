import { useState, useEffect } from 'react';
import axios from 'axios';
import { Company, Subsidiary } from '../types/organization';

// Schnittstelle für die Daten einer neuen Tochtergesellschaft
interface NewSubsidiary {
  name: string;
  location?: string;
  type?: 'building' | 'department';
  companyId?: string;
  parentId?: string | null;
  workHoursDay?: number;
  approvedHolidayDays?: number;
  publicHolidaysYear?: number;
  avgSickDaysYear?: number;
  workdaysWeek?: number;
  maxLoad?: number;
}

const initialCompany: Company = {
  _id: '',
  name: '',
  location: '', // Hinzugefügt, um den Typfehler zu beheben
  street: '',
  number: '',
  zip: '',
  city: '',
  area: '',
  country: '',
  workHoursDay: 8,
  approvedHolidayDays: 30,
  publicHolidaysYear: 12,
  avgSickDaysYear: 10,
  workdaysWeek: 5,
  maxLoad: 85,
  workHoursDayMaxLoad: 0,
  timezone: '',
  currency: 'EUR',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  subsidiaries: [],
};

export const useOrganization = () => {
  const [company, setCompany] = useState<Company>(initialCompany);

  const loadCompany = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/company', {
        params: { t: new Date().getTime() }, // Cache-Buster
      });
      const data = response.data;
      console.log('API Response:', data);
      if (data && !data.error) {
        setCompany(data);
      } else {
        console.log('Keine Daten geladen:', data);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('Fehler beim Laden der Firma:', errorMessage);
    }
  };

  useEffect(() => {
    loadCompany();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompany((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/company', company);
      setCompany(response.data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('Fehler beim Speichern der Firma:', errorMessage);
    }
  };

  const handleAddSubsidiary = async (subsidiary: NewSubsidiary) => {
    try {
      console.log('Sending subsidiary:', subsidiary);
      await axios.post('http://localhost:5001/api/company/subsidiaries', {
        name: subsidiary.name,
        location: subsidiary.location || '',
        type: subsidiary.type || 'building',
        companyId: subsidiary.companyId,
        parentId: subsidiary.parentId || null,
        workHoursDay: subsidiary.workHoursDay || 8,
        approvedHolidayDays: subsidiary.approvedHolidayDays || 30,
        publicHolidaysYear: subsidiary.publicHolidaysYear || 12,
        avgSickDaysYear: subsidiary.avgSickDaysYear || 10,
        workdaysWeek: subsidiary.workdaysWeek || 5,
        maxLoad: subsidiary.maxLoad || 85,
      });
      await loadCompany();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('Fehler beim Hinzufügen der Tochtergesellschaft:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleEditSubsidiary = async (id: string, updatedSubsidiary: Partial<Subsidiary>) => {
    try {
      await axios.put(`http://localhost:5001/api/company/subsidiaries/${id}`, updatedSubsidiary);
      await loadCompany();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('Fehler beim Bearbeiten der Tochtergesellschaft:', errorMessage);
    }
  };

  // Berechnete Felder mit Typprüfungen
  const workdaysYear = Number(company.workdaysWeek) > 0
    ? (
        (365 / 7) * Number(company.workdaysWeek) -
        Number(company.avgSickDaysYear || 0) -
        Number(company.approvedHolidayDays || 0) -
        Number(company.publicHolidaysYear || 0)
      ).toFixed(2)
    : '0.00';
  const workdaysMonth = Number(workdaysYear) > 0 ? (Number(workdaysYear) / 12).toFixed(2) : '0.00';
  const workHoursYear = Number(company.workHoursDay) > 0 && Number(workdaysYear) > 0
    ? (Number(company.workHoursDay) * Number(workdaysYear)).toFixed(2)
    : '0.00';
  const workHoursYearMaxLoad = Number(company.maxLoad) > 0 && Number(workHoursYear) > 0
    ? (Number(workHoursYear) * (Number(company.maxLoad) / 100)).toFixed(2)
    : '0.00';
  const workHoursDayMaxLoad = Number(workHoursYearMaxLoad) > 0
    ? (Number(workHoursYearMaxLoad) / 365).toFixed(2)
    : '0.00';
  const workHoursWorkday = Number(workHoursYearMaxLoad) > 0 && Number(workdaysYear) > 0
    ? (Number(workHoursYearMaxLoad) / Number(workdaysYear)).toFixed(2)
    : '0.00';
  const workHoursMonth = Number(workdaysMonth) > 0 && Number(workHoursWorkday) > 0
    ? (Number(workdaysMonth) * Number(workHoursWorkday)).toFixed(2)
    : '0.00';

  return {
    company,
    handleChange,
    handleSave,
    handleAddSubsidiary,
    handleEditSubsidiary,
    calculated: {
      workdaysYear,
      workdaysMonth,
      workHoursYear,
      workHoursYearMaxLoad,
      workHoursDayMaxLoad,
      workHoursWorkday,
      workHoursMonth,
    },
  };
};