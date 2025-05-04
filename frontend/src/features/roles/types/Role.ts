export interface Role {
  _id: string;
  name: string;
  abbreviation?: string;
  description?: string;
  department?: { _id: string; name: string } | string;
  supervisorRole?: { _id: string; name: string } | string;
  subordinateRoles?: (Role | string)[];
  company?: string;
  subsidiary?: { _id: string; name: string } | string;
  availableDailyHours?: number;
  workHoursDayMaxLoad?: number;
  paymentType: string;
  paymentValue: number;
  numberOfHolders: number;
  rights?: string;
  dailyTasks?: RecurringTask[];
  children?: Role[];
  level?: number;
}

export interface RecurringTask {
  _id?: string;
  role: { _id: string };
  name: string;
  frequency: number;
  rhythm: string;
  duration: number;
  unit: string;
}