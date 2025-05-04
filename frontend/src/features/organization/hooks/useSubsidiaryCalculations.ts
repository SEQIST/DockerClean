import { useState, useEffect } from 'react';
import { Company, Subsidiary } from '../types/organization';

interface CalculatedValues {
  workdaysYear: number;
  workHoursYear: number;
  workHoursYearMaxLoad: number;
  workHoursDayMaxLoad: number;
  workdaysMonth: number;
  workHoursWorkday: number;
}

// Überladene Hook-Signatur für Subsidiary und Company
export function useSubsidiaryCalculations(subsidiary: Partial<Subsidiary>): CalculatedValues;
export function useSubsidiaryCalculations(company: Partial<Company>): CalculatedValues;

export function useSubsidiaryCalculations(entity: Partial<Subsidiary> | Partial<Company>): CalculatedValues {
  const [calculatedValues, setCalculatedValues] = useState<CalculatedValues>({
    workdaysYear: 0,
    workHoursYear: 0,
    workHoursYearMaxLoad: 0,
    workHoursDayMaxLoad: 0,
    workdaysMonth: 0,
    workHoursWorkday: 0,
  });

  useEffect(() => {
    const workdaysYear =
      (365 / 7) * (entity.workdaysWeek ?? 7) -
      (entity.avgSickDaysYear ?? 0) -
      (entity.approvedHolidayDays ?? 0) -
      (entity.publicHolidaysYear ?? 0);
    const workdaysMonth = workdaysYear / 12;
    const workHoursYear = workdaysYear * (entity.workHoursDay ?? 8);
    const workHoursYearMaxLoad = workHoursYear * ((entity.maxLoad ?? 85) / 100);
    const workHoursDayMaxLoad = workHoursYearMaxLoad / 365;
    const workHoursWorkday = workdaysYear > 0 ? workHoursYearMaxLoad / workdaysYear : 0;

    setCalculatedValues({
      workdaysYear,
      workHoursYear,
      workHoursYearMaxLoad,
      workHoursDayMaxLoad,
      workdaysMonth,
      workHoursWorkday,
    });
  }, [entity]);

  return calculatedValues;
}