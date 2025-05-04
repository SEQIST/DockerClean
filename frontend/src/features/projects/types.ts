export interface WorkProduct {
  _id: string;
  name: string;
}

export interface Release {
  _id?: string;
  name: string;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  workProducts: { workProduct: string; knownItems: number; unknownItems: number }[];
  project: string;
  version?: { major: number; minor: number };
  abbreviation: string; // Neues erforderliches Feld
}

export interface Event {
  _id?: string;
  name: string;
  startDate: string | null;
  workProduct: { workProduct: string | null; knownItems: number; unknownItems: number } | null;
  release: string | { _id: string };
  project: string;
}

export interface Project {
  _id: string;
  name: string;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  plannedBudget: string | null;
  calculatedBudget: string | null;
  workProducts: { workProduct: string; knownItems: number; unknownItems: number }[];
  releases: Release[];
  events: Event[];
}