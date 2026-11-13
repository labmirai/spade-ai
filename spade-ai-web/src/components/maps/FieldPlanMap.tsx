"use client";

import { useEffect, useRef } from "react";
import type { Map as MaplibreMap, Marker, Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FieldDay, FieldPlan, FieldStop } from "@/lib/maps/fieldPlan";
import { apiJson } from "@/lib/api";

type Props = {
  plan: FieldPlan;
  activeDay: number | "all";
  selectedStopId: string | null;
  onSelectStop: (id: string) => void;
};

function stopsFor(plan: FieldPlan, activeDay: number | "all"): FieldStop[] {
  const days = activeDay === "all" ? plan.days : plan.days.filter((d) => d.day === activeDay);
  return days.flatMap((d) => d.stops);
}

function dayOf(plan: FieldPlan, stopId: string): FieldDay | undefined {
  return plan.days.find((d) => d.stops.some((s) => s.id === stopId));
}

export default function FieldPlanMap({
  plan,
  activeDay,
  selectedStopId,
  onSelectStop,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const markerCtorRef = useRef<typeof import("maplibre-gl").Marker | null>(null);
  const fittedKeyRef = useRef("");
  const onSelectRef = useRef(onSelectStop);
  onSelectRef.current = onSelectStop;

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current || mapRef.current) return;
      const maplibreMod = (await import("maplibre-gl")) as unknown as {
        default?: typeof import("maplibre-gl");
        Map: typeof import("maplibre-gl").Map;
        Marker: typeof import("maplibre-gl").Marker;
        NavigationControl: typeof import("maplibre-gl").NavigationControl;
        Popup: typeof import("maplibre-gl").Popup;
      };
      const maplibregl = maplibreMod.default ?? maplibreMod;
      markerCtorRef.current = maplibregl.Marker ?? maplibreMod.Marker;
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
        center: [89.18, 23.08],
        zoom: 9.15,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      mapRef.current = map;
      popupRef.current = new maplibregl.Popup({ closeButton: true, maxWidth: "280px" });

      map.on("load", async () => {
        let upazilas: GeoJSON.FeatureCollection;
        try {
          upazilas = await apiJson("/api/v1/maps/jessore/layers/upazilas");
        } catch (err) {
          console.error(err);
          return;
        }
        if (cancelled) return;
        map.addSource("upazilas", { type: "geojson", data: upazilas });
        map.addLayer({
          id: "upazila-fill",
          type: "fill",
          source: "upazilas",
          paint: { "fill-color": "#f8fafc", "fill-opacity": 0.95 },
        });
        map.addLayer({
          id: "upazila-line",
          type: "line",
          source: "upazilas",
          paint: { "line-color": "#334155", "line-width": 1.2 },
        });
        map.addSource("routes", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "routes",
          paint: {
            "line-color": ["get", "color"],
            "line-width": 3,
            "line-opacity": 0.85,
          },
        });
        map.resize();
      });
    }

    void init();
    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      popupRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let stopped = false;

    const apply = () => {
      const map = mapRef.current;
      if (!map) return false;
      const routeSource = map.getSource("routes") as
        | { setData: (d: GeoJSON.FeatureCollection) => void }
        | undefined;
      if (!routeSource) return false;

      const days = activeDay === "all" ? plan.days : plan.days.filter((d) => d.day === activeDay);
      routeSource.setData({
        type: "FeatureCollection",
        features: days.map((day) => ({
          type: "Feature",
          properties: { color: day.color, day: day.day },
          geometry: {
            type: "LineString",
            coordinates: day.stops.map((s) => [s.lon, s.lat]),
          },
        })),
      });

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      const stops = stopsFor(plan, activeDay);
      stops.forEach((stop) => {
        const day = dayOf(plan, stop.id);
        const index = day ? day.stops.findIndex((s) => s.id === stop.id) : 0;
        const el = document.createElement("button");
        el.type = "button";
        el.className = stop.id === selectedStopId ? "plan-pin is-selected" : "plan-pin";
        el.style.background = day?.color ?? "#111827";
        el.textContent = String(index + 1);
        el.title = stop.name;
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectRef.current(stop.id);
          popupRef.current
            ?.setLngLat([stop.lon, stop.lat])
            .setHTML(
              `<div class="popup"><strong>${stop.name}</strong><div class="popup__meta">${stop.sites} new sites · ${stop.upazila}</div><div class="popup__def">${stop.why}</div></div>`
            )
            .addTo(map);
        });
        const Ctor = markerCtorRef.current;
        if (!Ctor) return;
        const marker = new Ctor({ element: el, anchor: "center" })
          .setLngLat([stop.lon, stop.lat])
          .addTo(map);
        markersRef.current.push(marker);
      });

      const fitKey = String(activeDay);
      if (fittedKeyRef.current !== fitKey && stops.length > 0) {
        const lngs = stops.map((s) => s.lon);
        const lats = stops.map((s) => s.lat);
        map.fitBounds(
          [
            [Math.min(...lngs) - 0.06, Math.min(...lats) - 0.05],
            [Math.max(...lngs) + 0.06, Math.max(...lats) + 0.05],
          ],
          { padding: 36, duration: 0 }
        );
        fittedKeyRef.current = fitKey;
      }
      return true;
    };

    if (apply()) return;
    const id = window.setInterval(() => {
      if (stopped) return;
      if (apply()) window.clearInterval(id);
    }, 150);
    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, [plan, activeDay, selectedStopId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedStopId) return;
    const stop = plan.days.flatMap((d) => d.stops).find((s) => s.id === selectedStopId);
    if (!stop) return;
    map.flyTo({ center: [stop.lon, stop.lat], zoom: 10.2, essential: true });
  }, [plan, selectedStopId]);

  return <div ref={containerRef} className="main-map__canvas" />;
}
