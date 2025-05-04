export interface Subsidiary {
  _id: string;
  name: string;
  location: string;
  type: "building" | "department" | "company";
  isChildOf?: string | null;
  workHoursDay: number;
  approvedHolidayDays: number;
  publicHolidaysYear: number;
  avgSickDaysYear: number;
  workdaysWeek: number;
  maxLoad: number;
  workHoursDayMaxLoad: number;
  country: string;
  timezone: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  subsidiaries?: Subsidiary[];
}

export interface Company {
  _id: string;
  name: string;
  location: string;
  street?: string; // Neu hinzugefügt
  number?: string; // Neu hinzugefügt
  zip?: string; // Neu hinzugefügt
  city?: string; // Neu hinzugefügt
  area?: string; // Neu hinzugefügt
  workHoursDay: number;
  approvedHolidayDays: number;
  publicHolidaysYear: number;
  avgSickDaysYear: number;
  workdaysWeek: number;
  maxLoad: number;
  workHoursDayMaxLoad: number;
  country: string;
  timezone: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  subsidiaries: Subsidiary[];
}