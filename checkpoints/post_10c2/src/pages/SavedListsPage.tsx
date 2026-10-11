import React, { useEffect, useState, useCallback } from "react";
import { SavedListsManager } from "../components/SavedListsManager";
import { type SavedListModel, savedListsApi } from "../api/savedLists";
import { intelligenceApi, type IntelligenceEvaluationResult } from "../api/intelligence";
import { useCompanyStore } from "../store/companyStore";

export function SavedListsPage() {
  const { profile } = useCompanyStore();
  const [lists, setLists] = useState<SavedListModel[]>([]);
  const [opportunities, setOpportunities] = useState<IntelligenceEvaluationResult[]>([]);
  const [_loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedLists, evaluatedOpps] = await Promise.all([
        savedListsApi.list("comp-sa-001"),
        intelligenceApi.evaluate(profile?.id || "comp-sa-001"),
      ]);
      setLists(fetchedLists);
      setOpportunities(evaluatedOpps);
    } catch (err) {
      console.error("Failed to load saved lists data:", err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <SavedListsManager
        lists={lists}
        allOpportunities={opportunities}
        companyName={profile?.name || "Saudi Contractor"}
        onRefresh={loadData}
      />
    </div>
  );
}
