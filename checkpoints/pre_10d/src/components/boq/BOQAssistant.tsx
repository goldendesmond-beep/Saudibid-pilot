import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import {
  proposalApi,
  type BOQSheetModel,
  type BOQItemModel,
} from "../../api/proposals";
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Edit2,
} from "lucide-react";

interface BOQAssistantProps {
  boqId: string;
  onBOQUpdated?: (updated: BOQSheetModel) => void;
}

export function BOQAssistant({ boqId, onBOQUpdated }: BOQAssistantProps) {
  const { isAr } = useTranslation();

  const [boq, setBoq] = useState<BOQSheetModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingItemNumber, setEditingItemNumber] = useState<string | null>(null);
  const [editRate, setEditRate] = useState<string>("");
  const [editQty, setEditQty] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const loadBOQ = useCallback(async () => {
    if (!boqId) return;
    setLoading(true);
    try {
      const data = await proposalApi.getBOQ(boqId);
      setBoq(data);
    } catch (err) {
      console.error("Error loading BOQ:", err);
    } finally {
      setLoading(false);
    }
  }, [boqId]);

  useEffect(() => {
    loadBOQ();
  }, [loadBOQ]);

  const handleStartEdit = (item: BOQItemModel) => {
    setEditingItemNumber(item.item_number);
    setEditRate(item.unit_rate !== null ? String(item.unit_rate) : "");
    setEditQty(String(item.quantity));
    setEditNotes(item.notes || "");
  };

  const handleSaveItem = async (itemNumber: string) => {
    if (!boq) return;
    setIsSaving(true);
    try {
      const rateVal = editRate.trim() === "" ? null : parseFloat(editRate);
      const qtyVal = editQty.trim() === "" ? 1.0 : parseFloat(editQty);

      const updated = await proposalApi.updateBOQItem(boq.id, {
        item_number: itemNumber,
        unit_rate: rateVal,
        quantity: qtyVal,
        notes: editNotes,
        rate_source: "USER_ENTERED",
      });
      setBoq(updated);
      setEditingItemNumber(null);
      if (onBOQUpdated) onBOQUpdated(updated);
    } catch (err) {
      console.error("Error updating BOQ item:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-[#8b93a0]">
        <RefreshCw size={16} className="animate-spin text-[#c9a84c] mx-auto mb-2" />
        <span>{isAr ? "جاري تحميل جدول الكميات..." : "Loading BOQ worksheet..."}</span>
      </div>
    );
  }

  if (!boq) {
    return (
      <div className="p-6 text-center text-xs text-[#8b93a0]">
        {isAr ? "لم يتم العثور على جدول الكميات المحدد." : "Specified BOQ worksheet not found."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e2530] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#e8eaed]">
              {isAr ? boq.title_ar || boq.title : boq.title}
            </h3>
            <span className="font-mono text-xs text-[#c9a84c]">[{boq.id}]</span>
          </div>
          <p className="text-xs text-[#8b93a0] mt-1">
            {isAr
              ? "تسعير بنود مقاولة الباطن وحساب الإجمالي مع ضريبة القيمة المضافة 15% (هيئة الزكاة والضريبة والجمارك ZATCA)"
              : "Subcontract line item pricing with automated overhead, profit margin, and 15% ZATCA VAT calculation"}
          </p>
        </div>

        {/* Pricing Completeness Badge */}
        <div className="flex items-center gap-3">
          <div className="text-end">
            <div className="text-[11px] text-[#8b93a0]">
              {isAr ? "نسبة اكتمال التسعير" : "Pricing Completeness"}
            </div>
            <div className="text-sm font-bold text-[#e8eaed]">
              {boq.pricing_completeness_percentage}%
            </div>
          </div>
          {boq.unpriced_items_count > 0 ? (
            <span className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1">
              <AlertTriangle size={13} />
              <span>{boq.unpriced_items_count} {isAr ? "غير مسعر" : "Unpriced"}</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>{isAr ? "مسعر بالكامل" : "Fully Priced"}</span>
            </span>
          )}
        </div>
      </div>

      {/* BOQ Line Items Table */}
      <div className="rounded-lg border border-[#1e2530] bg-[#161a22] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-[#12151b] text-[#8b93a0] border-b border-[#1e2530]">
              <tr>
                <th className="py-2.5 px-3 text-start font-semibold w-16">{isAr ? "البند" : "Item"}</th>
                <th className="py-2.5 px-3 text-start font-semibold">{isAr ? "الوصف وتفاصيل العمل" : "Description & Scope"}</th>
                <th className="py-2.5 px-3 text-center font-semibold w-16">{isAr ? "الوحدة" : "Unit"}</th>
                <th className="py-2.5 px-3 text-end font-semibold w-24">{isAr ? "الكمية" : "Quantity"}</th>
                <th className="py-2.5 px-3 text-end font-semibold w-32">{isAr ? "سعر الوحدة (ر.س)" : "Unit Rate (SAR)"}</th>
                <th className="py-2.5 px-3 text-end font-semibold w-36">{isAr ? "الإجمالي (ر.س)" : "Total (SAR)"}</th>
                <th className="py-2.5 px-3 text-center font-semibold w-24">{isAr ? "المصدر" : "Source"}</th>
                <th className="py-2.5 px-3 text-end font-semibold w-20">{isAr ? "إجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2530] text-[#e8eaed]">
              {boq.items.map((item) => {
                const isEditing = editingItemNumber === item.item_number;
                const isUnpriced = item.unit_rate === null || item.unit_rate === undefined;

                return (
                  <tr
                    key={item.item_number}
                    className={`hover:bg-[#1a202c]/50 transition-colors ${
                      isUnpriced ? "bg-amber-950/10" : ""
                    }`}
                  >
                    {/* Item Number */}
                    <td className="py-3 px-3 font-mono font-bold text-[#c9a84c]">
                      {item.item_number}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#e8eaed]">
                        {isAr ? item.description_ar || item.description : item.description}
                      </div>
                      <div className="text-[11px] text-[#8b93a0] mt-0.5">
                        <span className="font-semibold">{item.trade_category}</span>
                        {item.notes && (
                          <>
                            <span className="mx-1.5">·</span>
                            <span>{item.notes}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-3 text-center font-mono text-[#8b93a0]">
                      {item.unit}
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3 text-end font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={editQty}
                          onChange={(e) => setEditQty(e.target.value)}
                          className="w-20 bg-[#12151b] border border-[#1e2530] rounded p-1 text-end text-xs text-[#e8eaed] focus:outline-none focus:border-[#c9a84c]"
                        />
                      ) : (
                        item.quantity.toLocaleString()
                      )}
                    </td>

                    {/* Unit Rate */}
                    <td className="py-3 px-3 text-end font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={editRate}
                          placeholder={isAr ? "أدخل السعر..." : "Enter rate..."}
                          onChange={(e) => setEditRate(e.target.value)}
                          className="w-28 bg-[#12151b] border border-[#1e2530] rounded p-1 text-end text-xs text-[#e8eaed] focus:outline-none focus:border-[#c9a84c]"
                        />
                      ) : isUnpriced ? (
                        <span className="text-amber-400 font-semibold italic">
                          {isAr ? "غير مسعر" : "UNPRICED"}
                        </span>
                      ) : (
                        item.unit_rate?.toLocaleString(undefined, { minimumFractionDigits: 2 })
                      )}
                    </td>

                    {/* Total */}
                    <td className="py-3 px-3 text-end font-mono font-bold">
                      {item.total !== null ? (
                        `${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      ) : (
                        <span className="text-amber-400">—</span>
                      )}
                    </td>

                    {/* Rate Source */}
                    <td className="py-3 px-3 text-center text-[10px] text-[#8b93a0]">
                      <span className="font-mono">{item.rate_source}</span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-end">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveItem(item.item_number)}
                          disabled={isSaving}
                          className="px-2 py-1 rounded bg-[#c9a84c] text-black font-semibold text-[11px] hover:bg-[#c9a84c]/90 transition-colors"
                        >
                          {isSaving ? "..." : isAr ? "حفظ" : "Save"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1 rounded text-[#8b93a0] hover:text-[#c9a84c] transition-colors"
                          title={isAr ? "تعديل السعر" : "Edit rate"}
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commercial Summary Calculation Card */}
      <div className="rounded-xl border border-[#1e2530] bg-[#161a22] p-5">
        <div className="flex items-center gap-2 border-b border-[#1e2530] pb-3 mb-4">
          <Calculator size={16} className="text-[#c9a84c]" />
          <h4 className="text-sm font-bold text-[#e8eaed]">
            {isAr ? "ملخص التسعير والتحليل المالي للعرض" : "Financial Pricing Breakdown & VAT Summary"}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Direct Costs Breakdown */}
          <div className="space-y-2.5">
            <div className="flex justify-between py-1 border-b border-[#1e2530]/50 text-[#8b93a0]">
              <span>{isAr ? "المجموع المباشر للبنود المسعرة (Subtotal):" : "Direct Items Subtotal:"}</span>
              <span className="font-mono text-[#e8eaed] font-semibold">
                {boq.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#1e2530]/50 text-[#8b93a0]">
              <span>
                {isAr ? "المصاريف الإدارية والعمومية (Overhead)" : "General Overhead"} ({boq.overhead_percent}%):
              </span>
              <span className="font-mono text-[#e8eaed]">
                {boq.overhead_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#1e2530]/50 text-[#8b93a0]">
              <span>
                {isAr ? "احتياطي الطوارئ والمخاطر (Contingency)" : "Risk Contingency"} ({boq.contingency_percent}%):
              </span>
              <span className="font-mono text-[#e8eaed]">
                {boq.contingency_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#1e2530]/50 text-[#8b93a0]">
              <span>
                {isAr ? "هامش الربح الصافي المستهدف (Target Margin)" : "Target Profit Margin"} ({boq.margin_percent}%):
              </span>
              <span className="font-mono text-[#e8eaed] text-emerald-400 font-semibold">
                +{boq.margin_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
              </span>
            </div>
          </div>

          {/* Tax & Grand Total */}
          <div className="space-y-2.5 p-4 rounded-lg bg-[#12151b] border border-[#1e2530]">
            <div className="flex justify-between text-[#8b93a0]">
              <span>{isAr ? "الصافي قبل الضريبة:" : "Net Before VAT:"}</span>
              <span className="font-mono text-[#e8eaed]">
                {(boq.subtotal + boq.overhead_amount + boq.contingency_amount + boq.margin_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
              </span>
            </div>

            <div className="flex justify-between text-[#8b93a0] pb-2 border-b border-[#1e2530]">
              <span>
                {isAr ? "ضريبة القيمة المضافة 15% (ZATCA VAT):" : "ZATCA VAT (15%):"}
              </span>
              <span className="font-mono text-[#c9a84c] font-semibold">
                +{boq.vat_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
              </span>
            </div>

            <div className="flex justify-between pt-1 items-baseline">
              <span className="text-sm font-extrabold text-[#e8eaed]">
                {isAr ? "الإجمالي الكلي للعرض (Grand Total):" : "Grand Total Proposal Value:"}
              </span>
              <span className="text-xl font-extrabold text-[#c9a84c] font-mono">
                {boq.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR
              </span>
            </div>

            <div className="text-[10px] text-[#8b93a0] mt-1">
              {isAr
                ? "* السعر شامل التجهيزات، العمالة، المواد، وضريبة القيمة المضافة النظامية للمملكة."
                : "* Pricing includes preliminary works, labor, materials, and statutory Saudi VAT."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
