"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import SiteNav from "@/components/maps/SiteNav";
import { apiJson } from "@/lib/api";
import type { FieldPlan } from "@/lib/maps/fieldPlan";

const FieldPlanMap = dynamic(() => import("@/components/maps/FieldPlanMap"), {
  ssr: false,
  loading: () => <div className="main-map main-map--loading">Loading map…</div>,
});

export default function PlanPage() {
  const [plan, setPlan] = useState<FieldPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number | "all">("all");
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiJson<FieldPlan>("/api/v1/maps/jessore/plan")
      .then((data) => {
        if (!cancelled) setPlan(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load the plan");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="app">
        <div className="main-map main-map--loading">{error}</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="app">
        <div className="main-map main-map--loading">Loading plan…</div>
      </div>
    );
  }

  const selected = plan.days
    .flatMap((d) => d.stops.map((s) => ({ ...s, day: d.day, color: d.color })))
    .find((s) => s.id === selectedStopId);

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__title">
          <h1>Where to sample next</h1>
          <span>
            {plan.totalSites} new sites · 3 days · base in {plan.base}
          </span>
        </div>
        <SiteNav />
      </header>

      <p className="plan-lead">{plan.why}</p>

      <div className="seg">
        <button
          type="button"
          className={activeDay === "all" ? "is-on" : undefined}
          onClick={() => setActiveDay("all")}
        >
          All days
        </button>
        {plan.days.map((day) => (
          <button
            key={day.day}
            type="button"
            className={activeDay === day.day ? "is-on" : undefined}
            onClick={() => setActiveDay(day.day)}
          >
            Day {day.day}
          </button>
        ))}
      </div>

      <section className="workspace">
        <div className="main-map">
          <FieldPlanMap
            plan={plan}
            activeDay={activeDay}
            selectedStopId={selectedStopId}
            onSelectStop={setSelectedStopId}
          />
        </div>
        <aside className="side">
          {plan.days
            .filter((d) => activeDay === "all" || d.day === activeDay)
            .map((day) => (
              <section key={day.day} className="panel">
                <div className="panel__head">
                  <h2>
                    <span className="day-dot" style={{ background: day.color }} />
                    Day {day.day} · {day.title}
                  </h2>
                  <span>{day.sites} sites</span>
                </div>
                <p className="hint" style={{ marginTop: 0 }}>
                  {day.route}
                </p>
                <p>{day.reason}</p>
                <ol className="stop-list">
                  {day.stops.map((stop) => (
                    <li key={stop.id}>
                      <button
                        type="button"
                        className={selectedStopId === stop.id ? "is-on" : undefined}
                        onClick={() => setSelectedStopId(stop.id)}
                      >
                        <strong>
                          {stop.name} · {stop.sites} sites
                        </strong>
                        <span>{stop.why}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          {selected && (
            <section className="panel">
              <div className="panel__head">
                <h2>{selected.name}</h2>
                <span>{selected.sites} sites</span>
              </div>
              <p>{selected.why}</p>
            </section>
          )}
        </aside>
      </section>
    </div>
  );
}
