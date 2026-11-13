export type NutrientKey =
  | "REAC_PH"
  | "ORG_MATTER"
  | "SOC"
  | "N"
  | "P"
  | "K"
  | "S"
  | "ZN"
  | "BO"
  | "CAL"
  | "MG"
  | "CU"
  | "FE"
  | "MN"
  | "SALINITY";

export type NutrientStats = {
  n: number;
  median: number | null;
  mean: number | null;
  min: number | null;
  max: number | null;
  p25: number | null;
  p75: number | null;
};

export type UpazilaSummary = {
  upazila: string;
  count: number;
  nutrients: Record<string, NutrientStats>;
  deficiency_rate: Record<string, number | null>;
  class_counts: Record<string, Record<string, number>>;
};

export type Summary = {
  title: string;
  source_note: string;
  sample_count_total: number;
  sample_count_jessore: number;
  sample_count_edge: number;
  outlier_count: number;
  labels: Record<string, string>;
  nutrients: NutrientKey[];
  class_ranges: Record<
    string,
    { label: string; min: number | null; max: number | null }[]
  >;
  deficient_below: Record<string, number>;
  overall: {
    nutrients: Record<string, NutrientStats>;
    deficiency_rate: Record<string, number | null>;
  };
  upazilas: UpazilaSummary[];
  map: {
    jessore_center: [number, number];
    jessore_zoom: number;
    bangladesh_center: [number, number];
    bangladesh_zoom: number;
  };
};

export type ChoroplethMode = "median" | "mean" | "deficiency";
