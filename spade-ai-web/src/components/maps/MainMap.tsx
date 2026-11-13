"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  FilterSpecification,
  Map as MaplibreMap,
  MapLayerMouseEvent,
  Popup,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ChoroplethMode, NutrientKey, Summary } from "@/lib/maps/types";
import {
  colorRamp,
  formatPct,
  formatValue,
  maplibreInterpolate,
  niceBreaks,
  pointColorRamp,
} from "@/lib/maps/colors";
import { apiJson } from "@/lib/api";

type Props = {
  nutrient: NutrientKey;
  mode: ChoroplethMode;
  showPoints: boolean;
  showChoropleth: boolean;
  hideEdge: boolean;
  onlyDeficient: boolean;
  onlyOutliers: boolean;
  summary: Summary;
  onSelectUpazila?: (name: string | null) => void;
};

type PointProps = {
  upazila?: string;
  district?: string;
  is_edge?: boolean;
  is_outlier?: boolean;
  deficient_fields?: string[];
  classes?: Record<string, string>;
} & Record<string, unknown>;

export default function MainMap({
  nutrient,
  mode,
  showPoints,
  showChoropleth,
  hideEdge,
  onlyDeficient,
  onlyOutliers,
  summary,
  onSelectUpazila,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const readyRef = useRef(false);
  const onSelectRef = useRef(onSelectUpazila);
  const nutrientRef = useRef(nutrient);
  const summaryRef = useRef(summary);
  const [error, setError] = useState<string | null>(null);

  onSelectRef.current = onSelectUpazila;
  nutrientRef.current = nutrient;
  summaryRef.current = summary;

  const pointValues = useMemo(() => {
    const s = summary.overall.nutrients[nutrient];
    if (!s || s.median == null) return [0, 1];
    const q1 = s.p25 ?? s.min ?? 0;
    const q2 = s.median;
    const q3 = s.p75 ?? s.max ?? q2;
    const iqr = Math.max(q3 - q1, 1e-9);
    // Winsorize color range so outliers don't wash most points to one color.
    const lo = Math.max(s.min ?? q1, q1 - 0.5 * iqr);
    const hi = Math.min(s.max ?? q3, q3 + 1.5 * iqr);
    return niceBreaks([lo, q1, q2, q3, hi], 5);
  }, [summary, nutrient]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current || mapRef.current) return;

      try {
        const maplibreMod = (await import("maplibre-gl")) as unknown as {
          default?: typeof import("maplibre-gl");
          Map: typeof import("maplibre-gl").Map;
          NavigationControl: typeof import("maplibre-gl").NavigationControl;
          AttributionControl: typeof import("maplibre-gl").AttributionControl;
          Popup: typeof import("maplibre-gl").Popup;
        };
        const maplibregl = maplibreMod.default ?? maplibreMod;

        if (cancelled || !containerRef.current) return;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {},
            layers: [
              {
                id: "background",
                type: "background",
                paint: { "background-color": "#dbe2ea" },
              },
            ],
          },
          center: summary.map.jessore_center,
          zoom: summary.map.jessore_zoom,
          maxBounds: [
            [87.5, 20.3],
            [93.0, 27.0],
          ],
        });

        map.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "top-right"
        );
        map.addControl(new maplibregl.AttributionControl({ compact: true }));
        mapRef.current = map;
        popupRef.current = new maplibregl.Popup({
          closeButton: true,
          maxWidth: "280px",
        });

        map.on("error", (e) => {
          console.error("MapLibre error", e);
          setError(e.error?.message || "Map failed to render");
        });

        map.on("load", async () => {
          try {
            const [districts, upazila, points] = await Promise.all([
              apiJson<GeoJSON.FeatureCollection>("/api/v1/maps/jessore/layers/districts"),
              apiJson<GeoJSON.FeatureCollection>("/api/v1/maps/jessore/layers/upazilas"),
              apiJson<GeoJSON.FeatureCollection>("/api/v1/maps/jessore/layers/points"),
            ]);

            if (cancelled) return;

            map.addSource("districts", { type: "geojson", data: districts });
            map.addSource("upazilas", { type: "geojson", data: upazila });
            map.addSource("points", { type: "geojson", data: points });

            map.addLayer({
              id: "districts-fill",
              type: "fill",
              source: "districts",
              paint: {
                "fill-color": [
                  "case",
                  ["get", "is_jessore"],
                  "#f1f5f9",
                  ["get", "is_khulna"],
                  "#e2e8f0",
                  "#cbd5e1",
                ],
                "fill-opacity": 0.95,
              },
            });
            map.addLayer({
              id: "districts-line",
              type: "line",
              source: "districts",
              paint: {
                "line-color": [
                  "case",
                  ["get", "is_jessore"],
                  "#b91c1c",
                  "#64748b",
                ],
                "line-width": ["case", ["get", "is_jessore"], 2, 0.6],
              },
            });

            map.addLayer({
              id: "upazila-fill",
              type: "fill",
              source: "upazilas",
              paint: {
                "fill-color": "#94a3b8",
                "fill-opacity": 0.45,
              },
            });
            map.addLayer({
              id: "upazila-line",
              type: "line",
              source: "upazilas",
              paint: {
                "line-color": "#1e293b",
                "line-width": 1.25,
              },
            });

            map.addLayer({
              id: "points-circle",
              type: "circle",
              source: "points",
              paint: {
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  8,
                  ["case", ["get", "is_outlier"], 4.5, 3.5],
                  11,
                  ["case", ["get", "is_outlier"], 7, 5.5],
                ],
                "circle-color": "#d73027",
                "circle-stroke-color": "#0f172a",
                "circle-stroke-width": 1.25,
                "circle-opacity": 0.95,
              },
            });

            const bindHover = (layer: string) => {
              map.on("mouseenter", layer, () => {
                map.getCanvas().style.cursor = "pointer";
              });
              map.on("mouseleave", layer, () => {
                map.getCanvas().style.cursor = "";
              });
            };
            bindHover("upazila-fill");
            bindHover("points-circle");
            bindHover("districts-fill");

            map.on("click", "districts-fill", (e: MapLayerMouseEvent) => {
              const f = e.features?.[0];
              if (f?.properties?.is_jessore) {
                map.flyTo({
                  center: summaryRef.current.map.jessore_center,
                  zoom: summaryRef.current.map.jessore_zoom,
                  essential: true,
                });
              }
            });

            map.on("click", "upazila-fill", (e: MapLayerMouseEvent) => {
              const name = e.features?.[0]?.properties?.upazila as
                | string
                | undefined;
              if (name) onSelectRef.current?.(name);
            });

            map.on("click", "points-circle", (e: MapLayerMouseEvent) => {
              const f = e.features?.[0];
              if (!f || !e.lngLat) return;
              const p = f.properties as PointProps;
              const classes =
                typeof p.classes === "string"
                  ? (JSON.parse(p.classes) as Record<string, string>)
                  : p.classes || {};
              const deficient =
                typeof p.deficient_fields === "string"
                  ? (JSON.parse(p.deficient_fields) as string[])
                  : p.deficient_fields || [];
              const currentNutrient = nutrientRef.current;
              const labels = summaryRef.current.labels;
              const value = p[currentNutrient] as number | null;
              const html = `
                <div class="popup">
                  <strong>${p.upazila ?? "Unknown"}</strong>
                  <div class="popup__meta">${p.district ?? ""}${p.is_edge ? " (outside Jessore)" : ""}</div>
                  <div class="popup__value">${labels[currentNutrient]}: <b>${formatValue(value)}</b></div>
                  <div class="popup__class">${classes[currentNutrient] ? `Class: ${classes[currentNutrient]}` : ""}</div>
                  <div class="popup__def">${deficient.length ? `Below critical: ${deficient.join(", ")}` : "No critical deficiencies flagged"}</div>
                </div>
              `;
              popupRef.current?.setLngLat(e.lngLat).setHTML(html).addTo(map);
              if (p.upazila) onSelectRef.current?.(p.upazila);
            });

            readyRef.current = true;
            map.resize();
            map.fire("styledata");
          } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to load map data");
          }
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load MapLibre");
      }
    }

    void init();

    return () => {
      cancelled = true;
      popupRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // init once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      if (!map.getLayer("upazila-fill") || !map.getLayer("points-circle")) return;

      const fillRamp = colorRamp(nutrient, mode === "deficiency");
      const pointRamp = pointColorRamp(nutrient, false);
      const prop =
        mode === "deficiency"
          ? `${nutrient}_def_rate`
          : mode === "mean"
            ? `${nutrient}_mean`
            : `${nutrient}_median`;

      if (mode === "deficiency") {
        map.setPaintProperty(
          "upazila-fill",
          "fill-color",
          maplibreInterpolate(prop, [0, 0.25, 0.5, 0.75, 1], fillRamp)
        );
      } else {
        map.setPaintProperty(
          "upazila-fill",
          "fill-color",
          maplibreInterpolate(prop, pointValues, fillRamp)
        );
      }
      // Keep fills translucent so sample points stay readable on every nutrient.
      map.setPaintProperty(
        "upazila-fill",
        "fill-opacity",
        showChoropleth ? (showPoints ? 0.42 : 0.78) : 0
      );
      map.setPaintProperty("upazila-line", "line-opacity", showChoropleth ? 1 : 0.45);

      map.setPaintProperty(
        "points-circle",
        "circle-color",
        maplibreInterpolate(nutrient, pointValues, pointRamp)
      );
      map.setPaintProperty("points-circle", "circle-stroke-color", "#0f172a");
      map.setPaintProperty("points-circle", "circle-stroke-width", 1.25);
      map.setLayoutProperty(
        "points-circle",
        "visibility",
        showPoints ? "visible" : "none"
      );

      const filters: unknown[] = ["all"];
      if (hideEdge) filters.push(["!=", ["get", "is_edge"], true]);
      if (onlyOutliers) filters.push(["==", ["get", "is_outlier"], true]);
      if (onlyDeficient) {
        filters.push(["==", ["get", `def_${nutrient}`], true]);
      }
      map.setFilter(
        "points-circle",
        filters.length > 1 ? (filters as FilterSpecification) : null
      );
    };

    if (readyRef.current) apply();
    const id = window.setInterval(() => {
      if (map.getLayer("points-circle")) {
        apply();
        window.clearInterval(id);
      }
    }, 150);
    return () => window.clearInterval(id);
  }, [
    nutrient,
    mode,
    showPoints,
    showChoropleth,
    hideEdge,
    onlyDeficient,
    onlyOutliers,
    pointValues,
  ]);

  const flyTo = (target: "bangladesh" | "jashore") => {
    const map = mapRef.current;
    if (!map) return;
    if (target === "bangladesh") {
      map.flyTo({
        center: summary.map.bangladesh_center,
        zoom: summary.map.bangladesh_zoom,
        essential: true,
      });
    } else {
      map.flyTo({
        center: summary.map.jessore_center,
        zoom: summary.map.jessore_zoom,
        essential: true,
      });
    }
  };

  const legendMin = mode === "deficiency" ? "0%" : formatValue(pointValues[0]);
  const legendMax =
    mode === "deficiency"
      ? "100%"
      : formatValue(pointValues[pointValues.length - 1]);
  const ramp = showPoints
    ? pointColorRamp(nutrient, mode === "deficiency")
    : colorRamp(nutrient, mode === "deficiency");

  if (error) {
    return (
      <div className="main-map main-map--loading">
        <div>
          <strong>Map error</strong>
          <div style={{ marginTop: 6, color: "#6b7280" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-map">
      <div className="map-toolbar">
        <button type="button" onClick={() => flyTo("bangladesh")}>
          Bangladesh
        </button>
        <button type="button" onClick={() => flyTo("jashore")}>
          Jashore
        </button>
      </div>
      <div ref={containerRef} className="main-map__canvas" />
      <div className="legend">
        <div className="legend__title">
          {mode === "deficiency"
            ? `% below critical — ${summary.labels[nutrient] ?? nutrient}`
            : mode === "mean"
              ? `Mean — ${summary.labels[nutrient] ?? nutrient}`
              : `Median — ${summary.labels[nutrient] ?? nutrient}`}
        </div>
        <div
          className="legend__bar"
          style={{ background: `linear-gradient(90deg, ${ramp.join(",")})` }}
        />
        <div className="legend__ends">
          <span>{legendMin}</span>
          <span>{legendMax}</span>
        </div>
        {summary.deficient_below[nutrient] != null && (
          <div className="legend__note">
            Critical below {formatValue(summary.deficient_below[nutrient])}
            {summary.overall.deficiency_rate[nutrient] != null &&
              ` · district ${formatPct(summary.overall.deficiency_rate[nutrient])}`}
          </div>
        )}
      </div>
    </div>
  );
}
