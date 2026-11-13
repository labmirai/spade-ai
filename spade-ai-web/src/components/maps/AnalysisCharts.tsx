"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChoroplethMode, NutrientKey, Summary } from "@/lib/maps/types";
import { formatPct, formatValue } from "@/lib/maps/colors";

const DEF_KEYS: NutrientKey[] = ["N", "P", "K", "S", "ZN", "BO", "ORG_MATTER"];
const BAR_COLORS = [
  "#bd0026",
  "#f03b20",
  "#fd8d3c",
  "#feb24c",
  "#fed976",
  "#ffffb2",
  "#c7e9b4",
  "#7fcdbb",
];

type Props = {
  summary: Summary;
  nutrient: NutrientKey;
  mode: ChoroplethMode;
  selectedUpazila: string | null;
};

export default function AnalysisCharts({
  summary,
  nutrient,
  mode,
  selectedUpazila,
}: Props) {
  const upazilaBars = [...summary.upazilas]
    .map((u) => ({
      name: u.upazila.replace("Jashore ", "J. "),
      fullName: u.upazila,
      value:
        mode === "deficiency"
          ? (u.deficiency_rate[nutrient] ?? 0) * 100
          : mode === "mean"
            ? (u.nutrients[nutrient]?.mean ?? 0)
            : (u.nutrients[nutrient]?.median ?? 0),
      count: u.count,
    }))
    .sort((a, b) => b.value - a.value);

  const deficiencyRows = summary.upazilas.map((u) => {
    const row: Record<string, string | number> = {
      name: u.upazila.replace("Jashore ", "J. "),
    };
    for (const key of DEF_KEYS) {
      row[key] = Math.round((u.deficiency_rate[key] ?? 0) * 100);
    }
    return row;
  });

  const selected = summary.upazilas.find((u) => u.upazila === selectedUpazila);
  const ranges = summary.class_ranges[nutrient] ?? [];

  return (
    <aside className="side">
      <section className="panel">
        <div className="panel__head">
          <h2>
            {mode === "deficiency"
              ? "% deficient"
              : mode === "mean"
                ? "Mean"
                : "Median"}{" "}
            by upazila
          </h2>
          <span>{summary.labels[nutrient]}</span>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={upazilaBars}
              layout="vertical"
              margin={{ left: 8, right: 8, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                unit={mode === "deficiency" ? "%" : ""}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={88}
                tick={{ fill: "#374151", fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) =>
                  mode === "deficiency"
                    ? [`${Number(value).toFixed(0)}%`, "Below critical"]
                    : [
                        formatValue(Number(value)),
                        mode === "mean" ? "Mean" : "Median",
                      ]
                }
                labelFormatter={(_, payload) =>
                  String(payload?.[0]?.payload?.fullName ?? "")
                }
              />
              <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                {upazilaBars.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {selected && (
          <div className="selected-card">
            <strong>{selected.upazila}</strong>
            <span>
              n={selected.count} · median{" "}
              {formatValue(selected.nutrients[nutrient]?.median)} · mean{" "}
              {formatValue(selected.nutrients[nutrient]?.mean)}
              {selected.deficiency_rate[nutrient] != null &&
                ` · deficient ${formatPct(selected.deficiency_rate[nutrient])}`}
            </span>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel__head">
          <h2>Deficiency heatmap</h2>
          <span>% samples below critical</span>
        </div>
        <div className="def-table-wrap">
          <table className="def-table">
            <thead>
              <tr>
                <th>Upazila</th>
                {DEF_KEYS.map((k) => (
                  <th key={k}>{k === "ORG_MATTER" ? "OM" : k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deficiencyRows.map((row) => (
                <tr
                  key={String(row.name)}
                  className={
                    selectedUpazila &&
                    selectedUpazila.replace("Jashore ", "J. ") === row.name
                      ? "is-selected"
                      : undefined
                  }
                >
                  <td>{row.name}</td>
                  {DEF_KEYS.map((k) => {
                    const v = Number(row[k]);
                    return (
                      <td key={k} style={{ background: heat(v), color: v >= 55 ? "#fff" : undefined }}>
                        {v}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ranges.length > 0 && (
          <p className="hint">
            Classes:{" "}
            {ranges
              .map((r) => {
                const band =
                  r.min == null
                    ? `<${formatValue(r.max)}`
                    : r.max == null
                      ? `≥${formatValue(r.min)}`
                      : `${formatValue(r.min)}–${formatValue(r.max)}`;
                return `${r.label} ${band}`;
              })
              .join(" · ")}
          </p>
        )}
      </section>
    </aside>
  );
}

function heat(pct: number): string {
  if (pct >= 70) return "#bd0026";
  if (pct >= 55) return "#f03b20";
  if (pct >= 40) return "#fd8d3c";
  if (pct >= 25) return "#feb24c";
  if (pct >= 10) return "#ffffb2";
  return "#f8fafc";
}
