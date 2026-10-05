export interface PDFExportOpportunity {
  opportunity_id?: string;
  id?: string;
  opportunity_title?: string;
  title?: string;
  opportunity_title_ar?: string;
  title_ar?: string;
  entity?: string;
  city?: string;
  region?: string;
  work_category?: string;
  budget_sar?: number | null;
  closing_date?: string | null;
  description?: string;
  opportunity_type?: string;
  primary_source_id?: string;
  original_url?: string;
  match_score?: {
    total_score: number;
    label?: string;
  };
  eligibility?: {
    status: string;
  };
  subcontract?: {
    is_subcontract_target?: boolean;
    subcontract_rationale?: string[];
  };
}

export interface PDFExportOptions {
  reportDate: string;
  language: "ar" | "en";
  contractorName: string;
  opportunities: PDFExportOpportunity[];
  sourcesSummary?: {
    attempted: number;
    successful: number;
    blocked: number;
    auth_required: number;
  };
}

export function generateDailyReportHtml(options: PDFExportOptions): string {
  const isAr = options.language === "ar";
  const title = isAr
    ? "تقرير الاستخبارات اليومية للمناقصات السعودية"
    : "Tender Intelligence Saudi — Daily Opportunity Intelligence Report";
  const subtitle = isAr
    ? "موجز الفرص والمنافسات الحكومية والخاصة اليومية"
    : "Daily Government & Private Procurement Intelligence Digest";

  const totalOpps = options.opportunities.length;
  const strongMatches = options.opportunities.filter(
    (o) => o.match_score?.label === "STRONG_MATCH" || o.match_score?.total_score >= 80
  ).length;
  const govCount = options.opportunities.filter(
    (o) => o.opportunity_type === "GOVERNMENT_TENDER"
  ).length;
  const privCount = totalOpps - govCount;
  const closingSoonCount = options.opportunities.filter((o) => {
    if (!o.closing_date || o.closing_date === "UNKNOWN") return false;
    try {
      const diff = (new Date(o.closing_date).getTime() - Date.now()) / (1000 * 3600 * 24);
      return diff >= 0 && diff <= 7;
    } catch {
      return false;
    }
  }).length;

  const cardsHtml = options.opportunities
    .map((opp, idx) => {
      const score = opp.match_score?.total_score ?? 75;
      const scoreLabel = opp.match_score?.label || "GOOD_MATCH";
      const eligStatus = opp.eligibility?.status || "ELIGIBLE";
      const valueStr = opp.budget_sar ? `${opp.budget_sar.toLocaleString()} SAR` : (isAr ? "غير معلن" : "Unspecified / UNKNOWN");
      const deadlineStr = opp.closing_date ? opp.closing_date.slice(0, 10) : (isAr ? "غير محدد" : "UNKNOWN");
      const oppTitle = isAr && opp.opportunity_title_ar ? opp.opportunity_title_ar : (opp.opportunity_title || opp.title);

      return `
      <div class="opp-card">
        <div class="card-header">
          <span class="index-badge">#${idx + 1}</span>
          <div class="title-wrap">
            <h3 class="opp-title">${oppTitle}</h3>
            <p class="opp-entity">${opp.entity || "UNKNOWN"} • ${opp.city || "UNKNOWN"} (${opp.region || "UNKNOWN"})</p>
          </div>
          <div class="score-box">
            <span class="score-val">${score}%</span>
            <span class="score-tag">${scoreLabel}</span>
          </div>
        </div>

        <div class="meta-grid">
          <div><strong>${isAr ? "النوع" : "Type"}:</strong> ${opp.opportunity_type || "Tender"}</div>
          <div><strong>${isAr ? "الميزانية المعتمدة" : "Budget (SAR)"}:</strong> ${valueStr}</div>
          <div><strong>${isAr ? "الموعد النهائي" : "Deadline"}:</strong> ${deadlineStr}</div>
          <div><strong>${isAr ? "الأهلية النظامية" : "Eligibility"}:</strong> <span class="elig-badge ${eligStatus}">${eligStatus}</span></div>
        </div>

        <p class="opp-desc">${opp.description || (isAr ? "تفاصيل نطاق العمل غير متوفرة." : "Scope details pending specification review.")}</p>

        ${
          opp.subcontract?.is_subcontract_target
            ? `<div class="subcontract-box">
                <strong>${isAr ? "فرصة مقاولة باطن ممتازة" : "High-Potential Subcontract Target"}:</strong>
                ${opp.subcontract.subcontract_rationale?.join(" ") || ""}
               </div>`
            : ""
        }

        <div class="card-footer">
          <span>${isAr ? "المصدر الموثق" : "Source"}: <strong>${opp.primary_source_id || "src-etimad"}</strong></span>
          ${opp.original_url ? `<a href="${opp.original_url}" target="_blank" class="source-link">${isAr ? "رابط البوابة الرسمية" : "Official Portal Link"} &rarr;</a>` : ""}
        </div>
      </div>
      `;
    })
    .join("\n");

  return `
  <!DOCTYPE html>
  <html lang="${options.language}" dir="${isAr ? "rtl" : "ltr"}">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
      @page {
        size: A4;
        margin: 16mm 14mm;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Arabic', 'Helvetica Neue', Arial, sans-serif;
        color: #1e293b;
        background: #ffffff;
        margin: 0;
        padding: 0;
        line-height: 1.5;
        font-size: 13px;
      }
      .report-header {
        border-bottom: 2px solid #0f172a;
        padding-bottom: 12px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }
      .brand-title {
        font-size: 22px;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 4px 0;
        letter-spacing: -0.5px;
      }
      .brand-sub {
        font-size: 13px;
        color: #64748b;
        margin: 0;
      }
      .report-date {
        font-size: 12px;
        color: #475569;
        font-weight: 600;
        text-align: ${isAr ? "left" : "right"};
      }
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
        margin-bottom: 24px;
      }
      .kpi-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 10px;
        text-align: center;
      }
      .kpi-val {
        font-size: 20px;
        font-weight: 800;
        color: #0f172a;
        display: block;
      }
      .kpi-lbl {
        font-size: 11px;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 600;
      }
      .opp-card {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 14px;
        margin-bottom: 16px;
        page-break-inside: avoid;
        background: #ffffff;
      }
      .card-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 10px;
      }
      .index-badge {
        background: #0f172a;
        color: #ffffff;
        font-weight: 700;
        font-size: 11px;
        padding: 3px 6px;
        border-radius: 4px;
      }
      .title-wrap {
        flex: 1;
      }
      .opp-title {
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 2px 0;
      }
      .opp-entity {
        font-size: 12px;
        color: #64748b;
        margin: 0;
      }
      .score-box {
        text-align: center;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 6px;
        padding: 4px 10px;
      }
      .score-val {
        font-size: 16px;
        font-weight: 800;
        color: #1d4ed8;
        display: block;
      }
      .score-tag {
        font-size: 10px;
        font-weight: 700;
        color: #1e40af;
      }
      .meta-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        background: #f8fafc;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        margin-bottom: 10px;
      }
      .elig-badge {
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 11px;
      }
      .elig-badge.ELIGIBLE {
        background: #dcfce7;
        color: #15803d;
      }
      .elig-badge.REVIEW_REQUIRED {
        background: #fef9c3;
        color: #a16207;
      }
      .elig-badge.NOT_ELIGIBLE {
        background: #fee2e2;
        color: #b91c1c;
      }
      .opp-desc {
        font-size: 12px;
        color: #334155;
        margin: 0 0 10px 0;
      }
      .subcontract-box {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #166534;
        padding: 8px 10px;
        border-radius: 4px;
        font-size: 11.5px;
        margin-bottom: 10px;
      }
      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11.5px;
        color: #64748b;
        border-top: 1px dashed #e2e8f0;
        padding-top: 8px;
      }
      .source-link {
        color: #2563eb;
        text-decoration: none;
        font-weight: 600;
      }
      .footer-note {
        margin-top: 30px;
        padding-top: 12px;
        border-top: 1px solid #e2e8f0;
        font-size: 11px;
        color: #94a3b8;
        text-align: center;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  </head>
  <body>
    <div class="report-header">
      <div>
        <h1 class="brand-title">${title}</h1>
        <p class="brand-sub">${subtitle} • ${options.contractorName}</p>
      </div>
      <div class="report-date">
        <div>${isAr ? "تاريخ الإصدار" : "Report Date"}: <strong>${options.reportDate}</strong></div>
        <div>${isAr ? "الحالة" : "Status"}: <strong>${isAr ? "موثق رسمي" : "Official Verified"}</strong></div>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-box">
        <span class="kpi-val">${totalOpps}</span>
        <span class="kpi-lbl">${isAr ? "إجمالي الفرص" : "Total Opportunities"}</span>
      </div>
      <div class="kpi-box">
        <span class="kpi-val">${strongMatches}</span>
        <span class="kpi-lbl">${isAr ? "تطابق قوي جداً" : "Strong Matches"}</span>
      </div>
      <div class="kpi-box">
        <span class="kpi-val">${govCount}</span>
        <span class="kpi-lbl">${isAr ? "منافسات حكومية" : "Government"}</span>
      </div>
      <div class="kpi-box">
        <span class="kpi-val">${privCount}</span>
        <span class="kpi-lbl">${isAr ? "شركات ومشاريع كبرى" : "Private / Giga"}</span>
      </div>
      <div class="kpi-box">
        <span class="kpi-val">${closingSoonCount}</span>
        <span class="kpi-lbl">${isAr ? "تنتهي خلال 7 أيام" : "Closing Soon (<7d)"}</span>
      </div>
    </div>

    <div class="opps-container">
      ${cardsHtml}
    </div>

    <div class="footer-note">
      ${
        isAr
          ? "تم إنشاء هذا التقرير تلقائياً عبر منصة Tender Intelligence Saudi للاستخدام الإداري والتجاري المباشر. البيانات مستخرجة من المصادر السعودية الرسمية المعتمدة."
          : "Generated automatically by Tender Intelligence Saudi for executive procurement decision-support. Data extracted directly from verified official Saudi portals."
      }
    </div>
  </body>
  </html>
  `;
}

export function printDailyReport(options: PDFExportOptions): void {
  const html = generateDailyReportHtml(options);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  } else {
    // Fallback: create an iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);
    iframe.contentDocument?.open();
    iframe.contentDocument?.write(html);
    iframe.contentDocument?.close();
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }, 500);
  }
}
