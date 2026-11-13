export type FieldStop = {
  id: string;
  name: string;
  upazila: string;
  lon: number;
  lat: number;
  sites: number;
  why: string;
};

export type FieldDay = {
  day: number;
  title: string;
  route: string;
  color: string;
  sites: number;
  reason: string;
  stops: FieldStop[];
};

export type FieldPlan = {
  title: string;
  base: string;
  totalSites: number;
  why: string;
  days: FieldDay[];
};
