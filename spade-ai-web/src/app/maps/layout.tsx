import type { Metadata } from "next";
import AdminGate from "@/components/maps/AdminGate";
import "./maps.css";

export const metadata: Metadata = {
  title: "Jashore soil map · SPADE-AI",
  robots: { index: false, follow: false },
};

export default function MapsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="soil-app">
      <AdminGate>{children}</AdminGate>
    </div>
  );
}
