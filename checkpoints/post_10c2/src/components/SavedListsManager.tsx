import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { type SavedListModel, savedListsApi } from "../api/savedLists";
import type { IntelligenceEvaluationResult } from "../api/intelligence";
import { Bookmark, Plus, Trash2, Edit2, FileDown, Award, CheckCircle2, Clock, Eye, AlertTriangle } from "lucide-react";
import { printDailyReport } from "../utils/pdfExport";
import { awardsApi, type SavedListAwardSummary } from "../api/awards";

interface SavedListsManagerProps {
  lists: SavedListModel[];
  allOpportunities: IntelligenceEvaluationResult[];
  companyName: string;
  onRefresh: () => void;
}

export const SavedListsManager: React.FC<SavedListsManagerProps> = ({
  lists,
  allOpportunities,
  companyName,
  onRefresh,
}) => {
  const { isRTL } = useTranslation();
  const [selectedListId, setSelectedListId] = useState<string>(lists[0]?.id || "");
  const [newListName, setNewListName] = useState("");
  const [newListNotes, setNewListNotes] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [awardSummary, setAwardSummary] = useState<SavedListAwardSummary | null>(null);
  const [watchingMap, setWatchingMap] = useState<Record<string, boolean>>({});

  const currentList = lists.find((l) => l.id === selectedListId) || lists[0];

  const fetchAwardSummary = useCallback(async (listId: string) => {
    if (!listId) return;
    try {
      const summary = await awardsApi.getSavedListAwardSummary(listId);
      setAwardSummary(summary);
    } catch (err) {
      console.error("Failed to load award summary for list:", err);
    }
  }, []);

  useEffect(() => {
    if (currentList?.id) {
      fetchAwardSummary(currentList.id);
    }
  }, [currentList?.id, fetchAwardSummary]);

  const handleWatchAward = async (oppId: string) => {
    try {
      await awardsApi.watch(oppId, "comp-sa-001", currentList?.id);
      setWatchingMap((prev) => ({ ...prev, [oppId]: true }));
      if (currentList?.id) {
        await fetchAwardSummary(currentList.id);
      }
    } catch (err) {
      console.error("Failed to watch award:", err);
    }
  };

  const matchedOpps = (currentList?.opportunity_ids || [])
    .map((id) => allOpportunities.find((o) => o.opportunity_id === id))
    .filter(Boolean) as IntelligenceEvaluationResult[];

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const created = await savedListsApi.create({
        name: newListName.trim(),
        notes: newListNotes.trim(),
        company_id: "comp-sa-001",
        opportunity_ids: [],
        original_snapshot_id: `snapshot-${new Date().toISOString().slice(0, 10)}`,
      });
      setNewListName("");
      setNewListNotes("");
      setIsCreating(false);
      onRefresh();
      setSelectedListId(created.id);
    } catch (err) {
      console.error("Failed to create list:", err);
    }
  };

  const handleUpdateList = async (listId: string) => {
    try {
      await savedListsApi.update(listId, {
        name: editName.trim() || undefined,
        notes: editNotes.trim() || undefined,
      });
      setEditingListId(null);
      onRefresh();
    } catch (err) {
      console.error("Failed to update list:", err);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!window.confirm(isRTL ? "هل أنت متأكد من حذف هذه القائمة؟" : "Are you sure you want to delete this list?")) {
      return;
    }
    try {
      await savedListsApi.delete(listId);
      onRefresh();
      if (selectedListId === listId) {
        const remaining = lists.filter((l) => l.id !== listId);
        if (remaining.length > 0) setSelectedListId(remaining[0].id);
      }
    } catch (err) {
      console.error("Failed to delete list:", err);
    }
  };

  const handleRemoveOpp = async (oppId: string) => {
    if (!currentList) return;
    const updatedIds = currentList.opportunity_ids.filter((id) => id !== oppId);
    try {
      await savedListsApi.update(currentList.id, {
        opportunity_ids: updatedIds,
      });
      onRefresh();
    } catch (err) {
      console.error("Failed to remove opportunity from list:", err);
    }
  };

  const handleExportListPDF = () => {
    if (!currentList) return;
    printDailyReport({
      reportDate: currentList.updated_at.slice(0, 10),
      language: isRTL ? "ar" : "en",
      contractorName: `${companyName} — ${currentList.name}`,
      opportunities: matchedOpps,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Creation Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-emerald-400" />
              <span>{isRTL ? "القوائم المحفوظة والمجموعات الاستراتيجية" : "Saved Opportunity Lists"}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRTL
                ? "تنظيم الفرص في قوائم مخصصة دائمة لمشاركتها مع الشركاء أو المتابعة لاحقاً"
                : "Organize strategic tenders into permanent lists for team review or partner dispatch."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentList && (
              <button
                onClick={handleExportListPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
              >
                <FileDown className="w-4 h-4 text-emerald-400" />
                <span>{isRTL ? "تصدير القائمة PDF" : "Export List PDF"}</span>
              </button>
            )}

            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRTL ? "إنشاء قائمة جديدة" : "New List"}</span>
            </button>
          </div>
        </div>

        {/* Create List Form Modal / Inline */}
        {isCreating && (
          <form onSubmit={handleCreateList} className="mt-4 p-4 rounded-lg bg-slate-950/80 border border-slate-700/80 space-y-3">
            <div className="font-semibold text-xs text-slate-200">
              {isRTL ? "إنشاء قائمة مخصصة جديدة" : "Create New Custom List"}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder={isRTL ? "اسم القائمة (مثال: قائمة السبت — 15 فرصة)" : "List Name (e.g. Eastern Region — October)"}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newListNotes}
                  onChange={(e) => setNewListNotes(e.target.value)}
                  placeholder={isRTL ? "ملاحظات وتوجيهات الفريق (اختياري)" : "Notes or instructions for partner (optional)"}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-bold text-white"
              >
                {isRTL ? "حفظ وإنشاء" : "Create List"}
              </button>
            </div>
          </form>
        )}

        {/* Saved Lists Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto mt-4 pt-3 border-t border-slate-800/80 pb-1 scrollbar-thin">
          {lists.map((l) => {
            const isSelected = (currentList?.id === l.id);
            return (
              <button
                key={l.id}
                onClick={() => setSelectedListId(l.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-slate-800 border-emerald-500/80 text-emerald-400 shadow-sm"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <span>{l.name}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 font-mono">
                  {l.opportunity_ids?.length || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current List Details */}
      {currentList ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">{currentList.name}</h3>
                <button
                  onClick={() => {
                    setEditingListId(currentList.id);
                    setEditName(currentList.name);
                    setEditNotes(currentList.notes);
                  }}
                  className="text-slate-400 hover:text-slate-200 p-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteList(currentList.id)}
                  className="text-rose-400 hover:text-rose-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {currentList.notes && (
                <p className="text-xs text-slate-400 mt-1">{currentList.notes}</p>
              )}
            </div>

            <div className="text-right text-xs text-slate-500">
              <div>{isRTL ? "تاريخ الحفظ" : "Created"}: {currentList.created_at.slice(0, 10)}</div>
              <div>{isRTL ? "آخر تحديث" : "Updated"}: {currentList.updated_at.slice(0, 10)}</div>
            </div>
          </div>

          {/* Edit List form if active */}
          {editingListId === currentList.id && (
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
              />
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Notes"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditingListId(null)} className="text-xs text-slate-400">Cancel</button>
                <button
                  onClick={() => handleUpdateList(currentList.id)}
                  className="text-xs bg-emerald-600 px-3 py-1 rounded text-white font-bold"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Stage 7: Saved List Award Summary */}
          {awardSummary && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">
                    {isRTL ? "ملخص حالة الترسيات للمجموعة المحفوظة" : "Saved List Award Tracking Summary"}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {awardSummary.total_watched} {isRTL ? "منافسة" : "Tenders"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-emerald-500/30 text-center">
                  <span className="text-slate-400 block text-[10px]">{isRTL ? "تمت الترسية" : "Awarded"}</span>
                  <strong className="text-emerald-400 font-mono text-sm">{awardSummary.counts.AWARDED}</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-amber-500/30 text-center">
                  <span className="text-slate-400 block text-[10px]">{isRTL ? "قيد التقييم" : "Pending"}</span>
                  <strong className="text-amber-400 font-mono text-sm">{awardSummary.counts.AWARD_PENDING}</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-700 text-center">
                  <span className="text-slate-400 block text-[10px]">{isRTL ? "غير معلنة" : "Not Public"}</span>
                  <strong className="text-slate-300 font-mono text-sm">{awardSummary.counts.RESULT_NOT_PUBLIC}</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-rose-500/30 text-center">
                  <span className="text-slate-400 block text-[10px]">{isRTL ? "ملغاة" : "Cancelled"}</span>
                  <strong className="text-rose-400 font-mono text-sm">{awardSummary.counts.CANCELLED}</strong>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-amber-500/40 text-center">
                  <span className="text-slate-400 block text-[10px]">{isRTL ? "تضارب بالأدلة" : "Conflicting"}</span>
                  <strong className="text-amber-400 font-mono text-sm">{awardSummary.counts.CONFLICTING}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Opps in this list */}
          {matchedOpps.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              {isRTL
                ? "لا توجد فرص في هذه القائمة حالياً. يمكنك حفظ الفرص بالضغط على علامة الحفظ في شاشة المستكشف."
                : "No opportunities saved in this list yet. Click the bookmark icon on any opportunity card in the Explorer to add."}
            </div>
          ) : (
            <div className="space-y-3">
              {matchedOpps.map((opp) => {
                const awardItem = awardSummary?.items.find((i) => i.opportunity_id === opp.opportunity_id);
                const isAwarded = awardItem && awardItem.award_status.startsWith("AWARDED");
                const isPending = awardItem && awardItem.award_status === "AWARD_PENDING";
                const isWatching = watchingMap[opp.opportunity_id] || (awardItem && awardItem.award_status !== "NO_RESULT_FOUND_YET");

                return (
                  <div
                    key={opp.opportunity_id}
                    className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-emerald-400">
                          {opp.entity} • {opp.city}
                        </span>

                        {isAwarded && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            {isRTL ? `فاز بها: ${awardItem.winner}` : `Awarded: ${awardItem.winner}`}
                          </span>
                        )}

                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            {isRTL ? "قيد تقييم العروض" : "Evaluation In Progress"}
                          </span>
                        )}

                        {awardItem?.award_status === "RESULT_NOT_PUBLIC" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-600">
                            <Eye className="w-3 h-3" />
                            {isRTL ? "النتيجة غير معلنة" : "Result Not Public"}
                          </span>
                        )}

                        {awardItem?.award_status === "CONFLICTING_SOURCES" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            {isRTL ? "تضارب بين المصادر" : "Conflicting Reports"}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-100">
                        {isRTL && opp.opportunity_title_ar ? opp.opportunity_title_ar : opp.opportunity_title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {opp.budget_sar ? `${opp.budget_sar.toLocaleString()} SAR` : "UNKNOWN"} • Closing: {opp.closing_date ? opp.closing_date.slice(0, 10) : "UNKNOWN"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                        {opp.match_score.total_score}%
                      </span>

                      {!isWatching ? (
                        <button
                          onClick={() => handleWatchAward(opp.opportunity_id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                          title={isRTL ? "تفعيل مراقبة الترسية" : "Watch Award"}
                        >
                          <Award className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isRTL ? "مراقبة الترسية" : "Watch"}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 px-2 py-1 bg-emerald-950/30 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          {isRTL ? "قيد المراقبة" : "Watching"}
                        </span>
                      )}

                      <button
                        onClick={() => handleRemoveOpp(opp.opportunity_id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title={isRTL ? "إزالة من القائمة" : "Remove"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
