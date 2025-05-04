import { Subsidiary } from '../types/organization';

export const cleanSubsidiary = (sub: Subsidiary): Subsidiary => {
  const cleaned: Subsidiary = {
    _id: sub._id,
    name: sub.name,
    location: sub.location || "",
    type: sub.type || "building",
    isChildOf: sub.isChildOf || null,
    workHoursDay: sub.workHoursDay || 8,
    approvedHolidayDays: sub.approvedHolidayDays || 30,
    publicHolidaysYear: sub.publicHolidaysYear || 12,
    avgSickDaysYear: sub.avgSickDaysYear || 10,
    workdaysWeek: sub.workdaysWeek || 5,
    maxLoad: sub.maxLoad || 85,
    workHoursDayMaxLoad: sub.workHoursDayMaxLoad || 0,
    country: sub.country || "",
    timezone: sub.timezone || "",
    currency: sub.currency || "EUR",
    createdAt: sub.createdAt || new Date().toISOString(),
    updatedAt: sub.updatedAt || new Date().toISOString(),
    subsidiaries: [],
  };
  if (sub.subsidiaries && Array.isArray(sub.subsidiaries)) {
    cleaned.subsidiaries = sub.subsidiaries.map((child) => cleanSubsidiary(child));
  }
  return cleaned;
};