export interface Role {
    _id: string;
    name: string;
    description?: string;
    abbreviation?: string;
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
    tasks?: RecurringTask[];
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
  
  export interface Activity {
    _id: string;
    title: string;
    abbreviation: string;
    description: string;
    role: Role | string;
    workProduct?: WorkProduct | string;
    trigger?: Trigger | string;
  }
  
  export interface WorkProduct {
    _id?: string;
    name: string;
    number?: string ; // Angepasst an processService.ts
    useMode: "Internal" | "None" | "FromCustomer" | "FromSupplier" | "ToCustomer" | undefined; // Angepasst an processService.ts
    cost: number | null;
    description: string;
    digitalisierbarDurch: string[];
    trigger?: Trigger | string;
  }
  
  export interface Process {
    _id: string;
    name: string;
    description: string;
    activities: Activity[];
    trigger?: Trigger | string;
    result: WorkProduct | string;
  }
  
  export interface Trigger {
    _id: string;
    name: string;
    source: WorkProduct | string;
    target: Activity | Process | string;
  }