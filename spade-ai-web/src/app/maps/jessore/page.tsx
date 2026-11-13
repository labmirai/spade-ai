"use client";

import { useEffect, useState } from "react";
import Dashboard from "@/components/maps/Dashboard";
import { apiJson } from "@/lib/api";
import type { Summary } from "@/lib/maps/types";

export default function JessoreMapPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiJson<Summary>("/api/v1/maps/jessore/summary")
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load the map");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="app">
        <div className="main-map main-map--loading">
          <div>
            <strong>Could not load Jashore data</strong>
            <div style={{ marginTop: 6 }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="app">
        <div className="main-map main-map--loading">Loading Jashore soil map…</div>
      </div>
    );
  }

  return <Dashboard summary={summary} />;
}
