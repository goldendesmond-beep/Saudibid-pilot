import React from "react";
import { SourceHealthDashboard } from "../components/SourceHealthDashboard";

export function SourceHealthPage() {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <SourceHealthDashboard />
    </div>
  );
}
