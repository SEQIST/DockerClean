interface Task {
  _id?: string;
  role: { _id: string };
  name: string;
  frequency: number;
  rhythm: string;
  duration: number;
  unit: string;
}

interface Company {
  _id: string;
  subsidiaries?: Subsidiary[];
  workdaysWeek?: number;
  avgSickDaysYear?: number;
  approvedHolidayDays?: number;
  publicHolidaysYear?: number;
  workHoursDay?: number;
  workHoursDayMaxLoad?: number | string; // Kann String oder Zahl sein
}

interface Subsidiary {
  _id: string;
  workdaysWeek?: number;
  avgSickDaysYear?: number;
  approvedHolidayDays?: number;
  publicHolidaysYear?: number;
  workHoursDay?: number;
  workHoursDayMaxLoad?: number | string; // Kann String oder Zahl sein
}

interface Role {
  _id: string;
  name: string;
  abbreviation?: string;
  department?: { _id: string; name: string } | string;
  supervisorRole?: { _id: string; name: string } | string;
  subordinateRoles?: (Role | string)[];
  company?: string;
  subsidiary?: { _id: string } | string;
  availableDailyHours?: number;
  workHoursDayMaxLoad?: number;
  paymentType: string;
  paymentValue: number;
  numberOfHolders: number;
  rights?: string;
  tasks?: Task[];
}

const calculateTaskHoursPerYear = (task: Task, workdaysYear: number, workdaysWeek: number, workHoursDay: number) => {
  const freq = task.frequency;
  let durationInHours = task.duration;
  switch (task.unit) {
    case 'minutes': durationInHours /= 60; break;
    case 'days': durationInHours *= (workHoursDay || 8); break;
    default: break;
  }
  let totalHours;
  switch (task.rhythm) {
    case 'hourly': totalHours = freq * 365 * durationInHours; break;
    case 'daily': totalHours = freq * workdaysYear * durationInHours; break;
    case 'weekly': totalHours = freq * (workdaysYear / workdaysWeek) * durationInHours; break;
    case 'monthly': totalHours = freq * 12 * durationInHours; break;
    case 'yearly': totalHours = freq * durationInHours; break;
    default: totalHours = 0;
  }
  return totalHours;
};

const calculateRoleHours = (
  role: Role,
  company: Company,
  subsidiaries: Subsidiary[],
  tasks: Task[]
): { workHoursDayMaxLoad: number; availableDailyHours: number } => {
  const subsidiaryId = typeof role.subsidiary === 'object' && role.subsidiary?._id ? role.subsidiary._id : role.subsidiary;
  const subsidiary = subsidiaryId && Array.isArray(subsidiaries) ? subsidiaries.find(s => s._id.toString() === subsidiaryId?.toString()) : null;
  const workdaysWeek = subsidiary?.workdaysWeek || company?.workdaysWeek || 5;
  const avgSickDaysYear = subsidiary?.avgSickDaysYear || company?.avgSickDaysYear || 10;
  const approvedHolidayDays = subsidiary?.approvedHolidayDays || company?.approvedHolidayDays || 30;
  const publicHolidaysYear = subsidiary?.publicHolidaysYear || company?.publicHolidaysYear || 12;
  const workHoursDay = subsidiary?.workHoursDay || company?.workHoursDay || 8;

  // Stunden/Tag (Max) ist workHoursDayMaxLoad aus subsidiary oder company
  const workHoursDayMaxLoadRaw = subsidiary?.workHoursDayMaxLoad ?? company?.workHoursDayMaxLoad ?? 8;
  const workHoursDayMaxLoad = Number(workHoursDayMaxLoadRaw);

  // Berechne die effektiven Arbeitstage für die Tätigkeiten
  const workdaysYear = (365 / 7) * workdaysWeek - avgSickDaysYear - approvedHolidayDays - publicHolidaysYear;

  // Berechne die tägliche Arbeitslast der repetitiven Tätigkeiten
  const roleTasks = Array.isArray(tasks) ? tasks.filter(t => t.role && t.role._id && t.role._id.toString() === role._id.toString()) : [];
  const totalTaskHoursPerYear = roleTasks.reduce((sum, task) => sum + calculateTaskHoursPerYear(task, workdaysYear, workdaysWeek, workHoursDay), 0);
  const dailyTaskHours = totalTaskHoursPerYear / 365;

  // Max Verfügbar ist workHoursDayMaxLoad minus die tägliche Arbeitslast der Tätigkeiten
  const availableDailyHours = workHoursDayMaxLoad - dailyTaskHours;

  return { workHoursDayMaxLoad, availableDailyHours };
};

export { calculateRoleHours };