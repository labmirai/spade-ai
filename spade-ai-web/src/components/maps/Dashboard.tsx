"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ChoroplethMode, NutrientKey, Summary } from "@/lib/maps/types";
import { formatPct, formatValue } from "@/lib/maps/colors";
import AnalysisCharts from "./AnalysisCharts";
import SiteNav from "./SiteNav";

const MainMap = dynamic(
  () =>
    import("./MainMap").catch((err) => {
      console.error("MainMap import failed", err);
      return {
        default: function MapImportError() {
          return (
            <div className="main-map main-map--loading">
              <div>
                <strong>Could not load map module</strong>
                <div style={{ marginTop: 6, color: "#6b7280" }}>
                  {err instanceof Error ? err.message : "Unknown import error"}
                </div>
              </div>
            </div>
          );
        },
      };
    }),
  {
    ssr: false,
    loading: () => <div className="main-map main-map--loading">Loading map…</div>,
  }
);

const PRIMARY: NutrientKey[] = [
  "REAC_PH",
  "ORG_MATTER",
  "N",
  "P",
  "K",
  "S",
  "ZN",
  "BO",
];

type Props = { summary: Summary };

export default function Dashboard({ summary }: Props) {
  const [nutrient, setNutrient] = useState<NutrientKey>("P");
  const [mode, setMode] = useState<ChoroplethMode>("median");
  const [showPoints, setShowPoints] = useState(true);
  const [showChoropleth, setShowChoropleth] = useState(true);
  const [hideEdge, setHideEdge] = useState(true);
  const [onlyDeficient, setOnlyDeficient] = useState(false);
  const [onlyOutliers, setOnlyOutliers] = useState(false);
  const [selectedUpazila, setSelectedUpazila] = useState<string | null>(null);

  const moreNutrients = useMemo(
    () => summary.nutrients.filter((n) => !PRIMARY.includes(n)),
    [summary.nutrients]
  );

  const overall = summary.overall.nutrients[nutrient];
  const defRate = summary.overall.deficiency_rate[nutrient];
  const hasCritical = summary.deficient_below[nutrient] != null;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__title">
          <h1>Jashore Soil Nutrients</h1>
          <span>
            {summary.sample_count_jessore.toLocaleString()} samples · 8 upazilas
          </span>
        </div>
        <SiteNav />
        <div className="topbar__controls">
          <label className="field">
            <span>Nutrient</span>
            <select
              value={nutrient}
              onChange={(e) => setNutrient(e.target.value as NutrientKey)}
            >
              <optgroup label="Main">
                {PRIMARY.map((key) => (
                  <option key={key} value={key}>
                    {summary.labels[key]}
                  </option>
                ))}
              </optgroup>
              <optgroup label="More">
                {moreNutrients.map((key) => (
                  <option key={key} value={key}>
                    {summary.labels[key]}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          <div className="seg">
            <button
              type="button"
              className={mode === "median" ? "is-on" : undefined}
              onClick={() => setMode("median")}
            >
              Median
            </button>
            <button
              type="button"
              className={mode === "mean" ? "is-on" : undefined}
              onClick={() => setMode("mean")}
            >
              Mean
            </button>
            <button
              type="button"
              className={mode === "deficiency" ? "is-on" : undefined}
              onClick={() => setMode("deficiency")}
              disabled={!hasCritical}
            >
              % deficient
            </button>
          </div>
        </div>
      </header>

      <section className="stats">
        <div>
          <span>Samples</span>
          <strong>{summary.sample_count_total.toLocaleString()}</strong>
        </div>
        <div>
          <span>Median</span>
          <strong>{formatValue(overall?.median)}</strong>
        </div>
        <div>
          <span>Mean</span>
          <strong>{formatValue(overall?.mean)}</strong>
        </div>
        <div>
          <span>Below critical</span>
          <strong>{formatPct(defRate)}</strong>
        </div>
        <div>
          <span>IQR</span>
          <strong>
            {formatValue(overall?.p25)} – {formatValue(overall?.p75)}
          </strong>
        </div>
      </section>

      <section className="toolbar">
        <label>
          <input
            type="checkbox"
            checked={showChoropleth}
            onChange={(e) => setShowChoropleth(e.target.checked)}
          />
          Upazila colors
        </label>
        <label>
          <input
            type="checkbox"
            checked={showPoints}
            onChange={(e) => setShowPoints(e.target.checked)}
          />
          Sample points
        </label>
        <label>
          <input
            type="checkbox"
            checked={hideEdge}
            onChange={(e) => setHideEdge(e.target.checked)}
          />
          Hide edge samples
        </label>
        <label>
          <input
            type="checkbox"
            checked={onlyDeficient}
            onChange={(e) => setOnlyDeficient(e.target.checked)}
            disabled={!hasCritical}
          />
          Deficient only
        </label>
        <label>
          <input
            type="checkbox"
            checked={onlyOutliers}
            onChange={(e) => setOnlyOutliers(e.target.checked)}
          />
          Outliers only
        </label>
      </section>

      <section className="workspace">
        <MainMap
          nutrient={nutrient}
          mode={mode}
          showPoints={showPoints}
          showChoropleth={showChoropleth}
          hideEdge={hideEdge}
          onlyDeficient={onlyDeficient}
          onlyOutliers={onlyOutliers}
          summary={summary}
          onSelectUpazila={setSelectedUpazila}
        />
        <AnalysisCharts
          summary={summary}
          nutrient={nutrient}
          mode={mode}
          selectedUpazila={selectedUpazila}
        />
      </section>

      <footer className="foot">
        BARC/SRDI-style critical levels · Boundaries from BBS/OCHA via geoBoundaries
      </footer>
    </div>
  );
}
