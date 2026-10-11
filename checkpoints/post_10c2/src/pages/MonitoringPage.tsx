import React, { useEffect, useState } from "react";
import { DailyMonitoringDashboard } from "../components/DailyMonitoringDashboard";
import { type DailySnapshotItem, monitoringApi } from "../api/monitoring";
import { useCompanyStore } from "../store/companyStore";

export function MonitoringPage() {
  const { profile } = useCompanyStore();
  const [snapshots, setSnapshots] = useState<DailySnapshotItem[]>([]);
  const [_loading, setLoading] = useState<boolean>(true);

  const loadSnapshots = async () => {
    try {
      setLoading(true);
      const list = await monitoringApi.listSnapshots();
      setSnapshots(list);
    } catch (err) {
      console.error("Failed to load snapshots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSnapshots();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <DailyMonitoringDashboard
        snapshots={snapshots}
        currentSnapshot={snapshots[0] || null}
        companyName={profile?.name || "Saudi Contractor"}
        onRefresh={loadSnapshots}
      />
    </div>
  );
}
