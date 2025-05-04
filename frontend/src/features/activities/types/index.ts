// src/features/activities/types/index.ts
export interface WorkProduct {
  _id?: string;
  name: string;
  abbreviation?: string;
  description: string;
}

export interface Process {
  _id: string;
  name: string;
}

export interface Role {
  _id: string;
  name: string;
}

export interface Activity {
  _id: string;
  name: string;
  process?: string | { _id: string; name: string } | null;
  executedBy?: string | { _id: string; name: string } | null;
  result?: string | { _id: string; name: string } | null;
  roles?: string[];
  multiplicator?: number; // Erlaube optional, um mit processService.ts übereinzustimmen
  compressor: string;
  executionMode: string;
  knownTime: number;
  estimatedTime: number;
  timeUnit: string;
  versionMajor: number;
  versionMinor: number;
  icon: string;
  description: string;
  abbreviation: string;
  timeFactor?: number;
  duration?: number;
  effort?: number;
  trigger: {
    workProducts: {
      _id: string | { _id: string };
      completionPercentage: number;
      isWorkloadDetermining?: boolean;
    }[];
    andOr: 'AND' | 'OR';
    timeTrigger: { unit: string; value: number; repetition: string };
    determiningFactorId?: string | null;
  };
}

export interface ActivityFormMainProps {
  activityId?: string;
  defaultProcess?: string;
}