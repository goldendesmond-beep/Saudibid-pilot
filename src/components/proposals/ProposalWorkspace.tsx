import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import {
  proposalApi,
  type ProposalModel,
  type BOQSheetModel,
} from "../../api/proposals";
import { BOQAssistant } from "../boq/BOQAssistant";
import {
  BriefcaseBusiness,
  Building2,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";

interface ProposalWorkspaceProps {
  initialProposalId?: string;
  initialTab?: "proposals" | "boq";
}

export function ProposalWorkspace({ initialProposalId, initialTab = "proposals" }: ProposalWorkspaceProps) {
  const { isAr } = useTranslation();

  const [proposals, setProposals] = useState<ProposalModel[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ProposalModel | null>(null);
  const [activeTab, setActiveTab] = useState<"proposals" | "boq">(initialTab);
  const [loading, setLoading] = useState(true);

  // Status change modal
  const [newStatus, setNewStatus] = useState<string>("");
  const [subRef, setSubRef] = useState<string>("");
  const [subNotes, setSubNotes] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const loadProposals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await proposalApi.getProposals();
      setProposals(data);
      if (data.length > 0) {
        if (initialProposalId) {
          const match = data.find((p) => p.id === initialProposalId);
          setSelectedProposal(match || data[0]);
        } else {
          setSelectedProposal((prev) => prev || data[0]);
        }
      }
    } catch (err) {
      console.error("Error loading proposals:", err);
    } finally {
      setLoading(false);
    }
  }, [initialProposalId]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  const handleOpenStatusModal = (status: string) => {
    setNewStatus(status);
    setSubRef(selectedProposal?.submission_reference || "");
    setSubNotes("");
    setStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposal || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await proposalApi.updateProposalStatus(selectedProposal.id, {
        status: newStatus,
        submission_reference: subRef || undefined,
        notes: subNotes || undefined,
      });
      setSelectedProposal(updated);
      setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setStatusModalOpen(false);
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleBOQUpdated = (updatedBOQ: BOQSheetModel) => {
    if (selectedProposal && selectedProposal.boq_id === updatedBOQ.id) {
      setSelectedProposal((prev) =>
        prev ? { ...prev, boq_grand_total_sar: updatedBOQ.grand_total } : prev
      );
      setProposals((prev) =>
        prev.map((p) =>
          p.id === selectedProposal.id ? { ...p, boq_grand_total_sar: updatedBOQ.grand_total } : p
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2530] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#e8eaed]">
            {isAr ? "إدارة عروض أسعار مقاولي الباطن و BOQ" : "Subcontract Proposal & BOQ Workspace"}
          </h2>
          <p className="text-xs text-[#8b93a0] mt-1">
            {isAr
              ? "ربط الترسية بالمقاول العام وحزمة الأعمال وجدول الكميات مع نظام اتخاذ قرار التقديم (Bid / No-Bid)"
              : "Traceable workflow connecting Award to Main Contractor, Trade Package, BOQ, and Explainable Bid/No-Bid Decision"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#12151b] rounded-lg border border-[#1e2530] self-start md:self-auto">
          <button
            onClick={() => setActiveTab("proposals")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "proposals"
                ? "bg-[#c9a84c] text-black shadow-sm"
                : "text-[#8b93a0] hover:text-[#e8eaed]"
            }`}
          >
            <BriefcaseBusiness size={14} />
            <span>{isAr ? "عروض الأسعار والقرار" : "Proposals & Bid Decision"}</span>
          </button>
          <button
            onClick={() => setActiveTab("boq")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "boq"
                ? "bg-[#c9a84c] text-black shadow-sm"
                : "text-[#8b93a0] hover:text-[#e8eaed]"
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>{isAr ? "جدول الكميات (BOQ)" : "BOQ Worksheet"}</span>
          </button>
        </div>
      </div>

      {loading && proposals.length === 0 ? (
        <div className="p-8 text-center text-[#8b93a0] text-sm">
          {isAr ? "جاري تحميل عروض الأسعار وجداول الكميات..." : "Loading subcontract proposals and BOQ worksheets..."}
        </div>
      ) : activeTab === "boq" && selectedProposal?.boq_id ? (
        <BOQAssistant boqId={selectedProposal.boq_id} onBOQUpdated={handleBOQUpdated} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Proposals List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-semibold text-[#8b93a0] uppercase tracking-wider">
              {isAr ? "عروض الأسعار النشطة" : "Active Subcontract Proposals"} ({proposals.length})
            </div>

            <div className="space-y-2">
              {proposals.map((prop) => {
                const isSelected = selectedProposal?.id === prop.id;
                return (
                  <button
                    key={prop.id}
                    onClick={() => setSelectedProposal(prop)}
                    className={`w-full text-start p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "border-[#c9a84c] bg-[#c9a84c]/10"
                        : "border-[#1e2530] bg-[#161a22] hover:border-[#2d3748]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#8b93a0] mb-1">
                      <span className="font-mono text-[#c9a84c] font-bold">{prop.trade_package_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#12151b] border border-[#1e2530] text-[#e8eaed]">
                        {prop.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-[#e8eaed] line-clamp-1 mb-1">
                      {isAr ? prop.title_ar || prop.title : prop.title}
                    </div>

                    <div className="text-[11px] text-[#8b93a0] flex items-center gap-1.5">
                      <Building2 size={12} className="text-[#c9a84c]" />
                      <span className="truncate">{prop.main_contractor_name}</span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1e2530] text-[11px]">
                      <span className="text-[#8b93a0] font-mono">
                        {prop.boq_grand_total_sar ? `${prop.boq_grand_total_sar.toLocaleString(undefined, { maximumFractionDigits: 0 })} SAR` : "Unpriced"}
                      </span>
                      <span className="font-bold text-emerald-400">
                        {prop.bid_decision} ({prop.bid_decision_score}%)
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Proposal Detail & Explainable Decision */}
          {selectedProposal && (
            <div className="lg:col-span-8 space-y-6">
              {/* Proposal Banner */}
              <div className="rounded-xl border border-[#1e2530] bg-[#161a22] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2530] pb-3">
                  <div>
                    <div className="text-[11px] text-[#c9a84c] font-mono font-bold">
                      {selectedProposal.trade_package_name}
                    </div>
                    <h3 className="text-base font-bold text-[#e8eaed] mt-0.5">
                      {isAr ? selectedProposal.title_ar || selectedProposal.title : selectedProposal.title}
                    </h3>
                  </div>

                  {/* Stage Badge & Actions */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded bg-[#12151b] border border-[#1e2530] text-xs font-bold text-[#c9a84c]">
                      {selectedProposal.status}
                    </span>
                    <button
                      onClick={() => handleOpenStatusModal("SUBMITTED")}
                      className="px-3 py-1 rounded bg-[#c9a84c] text-black font-semibold text-xs hover:bg-[#c9a84c]/90 transition-colors"
                    >
                      {isAr ? "تسجيل التقديم" : "Mark Submitted"}
                    </button>
                  </div>
                </div>

                {/* Lineage Traceability Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-[#12151b] border border-[#1e2530]">
                    <div className="text-[10px] text-[#8b93a0]">{isAr ? "المقاول العام" : "Main Contractor"}</div>
                    <div className="font-semibold text-[#e8eaed] mt-0.5 truncate">{selectedProposal.main_contractor_name}</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#12151b] border border-[#1e2530]">
                    <div className="text-[10px] text-[#8b93a0]">{isAr ? "المشروع" : "Project"}</div>
                    <div className="font-semibold text-[#e8eaed] mt-0.5 truncate">{selectedProposal.project_name}</div>
                  </div>
                  <div className="p-2.5 rounded bg-[#12151b] border border-[#1e2530]">
                    <div className="text-[10px] text-[#8b93a0]">{isAr ? "الموعد النهائي" : "Deadline"}</div>
                    <div className="font-semibold text-amber-400 mt-0.5 font-mono">
                      {selectedProposal.submission_deadline ? selectedProposal.submission_deadline.slice(0, 10) : "TBD"}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-[#12151b] border border-[#1e2530]">
                    <div className="text-[10px] text-[#8b93a0]">{isAr ? "إجمالي العرض مع الضريبة" : "Grand Total (VAT)"}</div>
                    <div className="font-semibold text-[#c9a84c] mt-0.5 font-mono">
                      {selectedProposal.boq_grand_total_sar ? `${selectedProposal.boq_grand_total_sar.toLocaleString(undefined, { maximumFractionDigits: 0 })} SAR` : "Pending"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Explainable Bid / No-Bid Decision Card */}
              <div className="rounded-xl border border-[#1e2530] bg-[#161a22] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1e2530] pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-[#c9a84c]" />
                    <h4 className="text-sm font-bold text-[#e8eaed]">
                      {isAr ? "نظام اتخاذ قرار التقديم (Bid / No-Bid Decision)" : "Explainable Bid / No-Bid Decision Analysis"}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8b93a0]">{isAr ? "النتيجة:" : "Result:"}</span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                      {selectedProposal.bid_decision} ({selectedProposal.bid_decision_score}%)
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[#8b93a0]">
                  {isAr
                    ? "التحليل المرجح لجاهزية المقاولة ونطاق الأعمال ومدى تناسب القدرات مع معايير المقاول العام دون تدخل خوارزمي غير مبرر."
                    : "Transparent evaluation of contractor capabilities, BOQ completeness, and geographic alignment."}
                </div>

                {/* Factors Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {selectedProposal.bid_decision_factors.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-[#12151b] border border-[#1e2530] space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-[#e8eaed]">{f.factor_name}</span>
                        <span className="font-mono text-[#c9a84c]">
                          {f.score}% (wt. {f.weight_percent}%)
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8b93a0]">{f.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions to open BOQ */}
              <div className="p-4 rounded-xl border border-[#1e2530] bg-[#12151b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#e8eaed]">
                    {isAr ? "جدول الكميات والتسعير المرتبط" : "Linked Bill of Quantities (BOQ)"}
                  </div>
                  <div className="text-[11px] text-[#8b93a0] mt-0.5">
                    {isAr
                      ? "يمكنك تعديل الأسعار، الكميات، وإضافة البنود مباشرة من محرر BOQ"
                      : "Inspect and update line rates, quantities, overheads, and 15% VAT."}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("boq")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#c9a84c] text-black font-semibold text-xs hover:bg-[#c9a84c]/90 transition-colors self-start sm:self-auto"
                >
                  <FileSpreadsheet size={14} />
                  <span>{isAr ? "فتح جدول الكميات للتسعير" : "Open BOQ Editor"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#1e2530] bg-[#161a22] p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#e8eaed]">
              {isAr ? "تحديث حالة عرض السعر" : "Update Proposal Status"}
            </h3>

            <form onSubmit={handleConfirmStatusChange} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#8b93a0] mb-1 font-medium">
                  {isAr ? "الحالة الجديدة" : "New Lifecycle Stage"}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#12151b] border border-[#1e2530] rounded p-2 text-[#e8eaed] focus:outline-none focus:border-[#c9a84c]"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  <option value="READY">READY</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="CLARIFICATION">CLARIFICATION</option>
                  <option value="REVISED">REVISED</option>
                  <option value="AWARDED">AWARDED</option>
                  <option value="LOST">LOST</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8b93a0] mb-1 font-medium">
                  {isAr ? "رقم المرجع / إشعار التقديم الرسمي" : "Official Submission Reference #"}
                </label>
                <input
                  type="text"
                  value={subRef}
                  onChange={(e) => setSubRef(e.target.value)}
                  className="w-full bg-[#12151b] border border-[#1e2530] rounded p-2 text-[#e8eaed] focus:outline-none focus:border-[#c9a84c]"
                  placeholder="e.g. NESMA-SUB-2026-0891"
                />
              </div>

              <div>
                <label className="block text-[#8b93a0] mb-1 font-medium">
                  {isAr ? "ملاحظات التقديم" : "Submission Notes"}
                </label>
                <textarea
                  rows={2}
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  className="w-full bg-[#12151b] border border-[#1e2530] rounded p-2 text-[#e8eaed] focus:outline-none focus:border-[#c9a84c]"
                  placeholder="Details of delivery or recipient..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2530]">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs text-[#8b93a0] hover:text-[#e8eaed]"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="px-4 py-1.5 rounded bg-[#c9a84c] text-black font-semibold text-xs hover:bg-[#c9a84c]/90 transition-colors"
                >
                  {isUpdatingStatus ? (isAr ? "جاري التحديث..." : "Updating...") : (isAr ? "تأكيد وتحديث الحالة" : "Confirm Update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
