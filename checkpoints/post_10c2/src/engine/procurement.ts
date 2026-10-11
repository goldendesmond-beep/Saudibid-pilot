import type {
  CompanyProfile,
  Tender,
  MatchResult,
  EligibilityCheck,
  PricingStats,
  SupplierWinRate,
  TrendSeries,
  BidDraft,
  TraceStep,
  RequirementChecklist,
  GapReport,
  BidDraftSection,
} from "../api/types";

export interface AwardRecord {
  id: string;
  source: "DIAVGEIA" | "KIMDIS";
  cpv_codes: string[];
  contracting_authority: string;
  supplier_name: string;
  supplier_vat: string | null;
  award_value: number;
  currency: string;
  award_date: string;
  nuts: string[];
  tender_ref: string | null;
  raw_doc_uri: string | null;
}

export function computeEligibility(profile: CompanyProfile, tender: Tender): EligibilityCheck {
  const failed: string[] = [];
  const warnings: string[] = [];

  // 1. Exclusion flags check (hard fail)
  const overlapFlags = (profile.exclusion_flags || []).filter((f) =>
    (tender.exclusion_flags || []).includes(f),
  );
  if (overlapFlags.length > 0) {
    failed.push(`exclusion flag overlap: ${overlapFlags.sort().join(", ")}`);
  }

  // 2. Excluded project types check (hard fail)
  if (profile.excluded_project_types && profile.excluded_project_types.length > 0) {
    const tenderDesc = `${tender.title} ${tender.description} ${tender.work_category || ""}`.toLowerCase();
    const hitExcluded = profile.excluded_project_types.find((ex) =>
      tenderDesc.includes(ex.toLowerCase()),
    );
    if (hitExcluded) {
      failed.push(`excluded project scope: ${hitExcluded}`);
    }
  }

  // 3. Financial requirement (hard fail)
  // Check against tender budget (SAR) vs annual turnover or guarantee capability
  const effectiveBudget = tender.budget_sar ?? tender.budget;
  const effectiveCapacity = profile.annual_turnover || profile.preferred_project_value_sar || 0;
  if (effectiveBudget !== null && effectiveBudget !== undefined) {
    const required = effectiveBudget * 1.0;
    if (effectiveCapacity > 0 && effectiveCapacity < required) {
      failed.push(`annual turnover ${effectiveCapacity} below required ${required}`);
    }
  }

  // 4. Deadline check (3-day lead window, hard fail)
  const deadlineDate = new Date(tender.deadline);
  const cutoff = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  if (deadlineDate <= cutoff) {
    failed.push(`deadline within 3-day lead window or past`);
  }

  // 5. Status check (hard fail)
  if (tender.status !== "open") {
    failed.push(`tender not open`);
  }

  // 6. Technical / activity tags coverage (soft warning)
  const allActivities = [
    ...(profile.main_activities || []),
    ...(profile.secondary_activities || []),
    ...(profile.capacity_tags || []),
  ];
  if (allActivities.length > 0) {
    const descLower = (tender.title + " " + tender.description + " " + (tender.work_category || "")).toLowerCase();
    const matched = allActivities.filter((t) => descLower.includes(t.toLowerCase()));
    const coverage = matched.length / allActivities.length;
    if (coverage < 0.25 && matched.length === 0) {
      warnings.push(`technical coverage ${(coverage * 100).toFixed(0)}% below recommended threshold`);
    }
  }

  // NOTE: Company size must affect ranking but must NOT automatically determine eligibility.

  return {
    passed: failed.length === 0,
    failed_criteria: failed,
    warnings,
    rule_version: "2.0.0-saudi",
  };
}

export function computeMatch(profile: CompanyProfile, tender: Tender): MatchResult {
  const reasons: string[] = [];
  let ruleScore = 0.0;

  // 1. Activity & Work Category overlap
  const allProfileActivities = [
    ...(profile.main_activities || []),
    ...(profile.secondary_activities || []),
    ...(profile.capacity_tags || []),
  ].map((a) => a.toLowerCase());

  const tenderText = `${tender.title} ${tender.description} ${tender.work_category || ""} ${(tender as unknown as { sector?: string }).sector || ""} ${(tender as unknown as { service_category?: string }).service_category || ""}`.toLowerCase();
  const matchedActivities = allProfileActivities.filter((act) => {
    if (tenderText.includes(act)) return true;
    const tokens = act.split(/[\s,&/]+/).filter((t) => t.length > 3);
    return tokens.some((token) => tenderText.includes(token));
  });
  const activityRatio = allProfileActivities.length > 0
    ? matchedActivities.length / Math.min(allProfileActivities.length, 3)
    : 0;

  // Also check legacy CPV overlap
  const tenderCpvs = tender.cpv_codes || [];
  const profileCpvs = profile.cpv_codes || [];
  const cpvOverlap = profileCpvs.filter((c) => tenderCpvs.includes(c)).length;
  const cpvRatio = tenderCpvs.length > 0 && profileCpvs.length > 0
    ? cpvOverlap / Math.min(profileCpvs.length, tenderCpvs.length)
    : 0;

  const combinedActivityScore = Math.max(Math.min(activityRatio, 1.0), Math.min(cpvRatio, 1.0));
  ruleScore += 0.35 * combinedActivityScore;
  if (combinedActivityScore > 0) {
    reasons.push(
      matchedActivities.length > 0
        ? `Matched activities: ${matchedActivities.slice(0, 2).join(", ")}`
        : `CPV overlap ${cpvOverlap} code(s)`,
    );
  }

  // 2. Saudi Region & City match (with NUTS fallback)
  const regionHit = (profile.saudi_regions || []).some((r) =>
    (tender.region && tender.region.toLowerCase().includes(r.toLowerCase())) ||
    tenderText.includes(r.toLowerCase()),
  ) || (profile.regions || []).some((r) => (tender.nuts || []).includes(r));

  const cityHit = (profile.saudi_cities || []).some((c) =>
    (tender.city && tender.city.toLowerCase().includes(c.toLowerCase())) ||
    tenderText.includes(c.toLowerCase()),
  );

  let locationScore = 0.0;
  if (cityHit) {
    locationScore = 1.0;
    reasons.push(`Direct city match: ${tender.city || "local city"}`);
  } else if (regionHit) {
    locationScore = 0.75;
    reasons.push(`Regional coverage in ${tender.region || "target region"}`);
  }
  ruleScore += 0.25 * locationScore;

  // 3. Project Budget vs Preferred Value & Guarantee Capability
  const effectiveBudget = tender.budget_sar ?? tender.budget;
  const effectiveCapacity = profile.annual_turnover || profile.preferred_project_value_sar || 0;
  const budgetFeasible = effectiveBudget === null || effectiveBudget === undefined || effectiveCapacity <= 0 || effectiveBudget <= effectiveCapacity * 1.5;
  ruleScore += 0.15 * (budgetFeasible ? 1.0 : 0.0);
  if (budgetFeasible && effectiveBudget) {
    reasons.push("Budget within financial capacity envelope");
  }

  // 4. Company Size Alignment (Affects ranking but NOT eligibility)
  // Large companies rank higher on major/mega projects; Small/Medium companies rank higher on small-to-mid projects
  let sizeFitScore = 0.5;
  if (effectiveBudget) {
    if (effectiveBudget >= 50000000) {
      // Major project (> 50M SAR)
      sizeFitScore = profile.company_size === "Large" ? 1.0 : profile.company_size === "Medium" ? 0.6 : 0.3;
    } else if (effectiveBudget <= 10000000) {
      // Small/medium project (< 10M SAR)
      sizeFitScore = profile.company_size === "Small" ? 1.0 : profile.company_size === "Medium" ? 0.8 : 0.5;
    } else {
      // Mid-tier project (10M - 50M SAR)
      sizeFitScore = profile.company_size === "Medium" ? 1.0 : profile.company_size === "Large" ? 0.8 : 0.6;
    }
  }
  ruleScore += 0.15 * sizeFitScore;
  if (sizeFitScore >= 0.8) {
    reasons.push(`Company size (${profile.company_size}) optimal for project scale`);
  }

  // 5. Classification Grade match
  let gradeScore = 0.5;
  if (profile.classification_grade === 1) gradeScore = 1.0;
  else if (profile.classification_grade === 2) gradeScore = 0.85;
  else if (profile.classification_grade === 3) gradeScore = 0.70;
  else if (profile.classification_grade === 4) gradeScore = 0.55;
  else if (profile.classification_grade === 5) gradeScore = 0.40;
  ruleScore += 0.10 * gradeScore;

  // Semantic similarity estimation
  let semanticScore = 0.35;
  let commonTerms = 0;
  const matchCandidates = [
    ...(profile.capacity_tags || []),
    ...(profile.equipment_tags || []),
    ...(profile.main_activities || []),
    profile.name,
  ];
  for (const tag of matchCandidates) {
    if (tag && tenderText.includes(tag.toLowerCase())) commonTerms++;
  }
  if (commonTerms > 0) {
    semanticScore = Math.min(0.95, 0.4 + commonTerms * 0.12);
  }
  if (combinedActivityScore > 0) {
    semanticScore = Math.min(0.95, semanticScore + 0.1);
  }

  const eligibility = computeEligibility(profile, tender);
  const totalScore = Number((0.4 * semanticScore + 0.6 * ruleScore).toFixed(2));

  return {
    tender_id: tender.id,
    company_id: profile.id,
    score: totalScore,
    semantic_score: Number(semanticScore.toFixed(2)),
    rule_score: Number(ruleScore.toFixed(2)),
    reasons,
    eligibility,
  };
}

export function computePricingStats(awards: AwardRecord[], cpv?: string): PricingStats {
  let filtered = awards;
  if (cpv) {
    filtered = filtered.filter((a) => a.cpv_codes.some((c) => c.includes(cpv)));
  }

  if (filtered.length === 0) {
    return {
      cpv: cpv || null,
      count: 0,
      min: null,
      max: null,
      mean: null,
      median: null,
      p25: null,
      p75: null,
      currency: "SAR",
    };
  }

  const values = filtered.map((a) => a.award_value).sort((a, b) => a - b);
  const n = values.length;
  const total = values.reduce((sum, v) => sum + v, 0);

  const p25 = values[Math.floor(0.25 * (n - 1))];
  const median = values[Math.floor(0.5 * (n - 1))];
  const p75 = values[Math.floor(0.75 * (n - 1))];

  return {
    cpv: cpv || null,
    count: n,
    min: values[0],
    max: values[n - 1],
    mean: Math.round(total / n),
    median,
    p25,
    p75,
    currency: "SAR",
  };
}

export function computeWinRates(
  awards: AwardRecord[],
  options?: { cpv?: string; authority?: string; topN?: number },
): SupplierWinRate[] {
  let filtered = awards;
  if (options?.cpv) {
    filtered = filtered.filter((a) => a.cpv_codes.some((c) => c.includes(options.cpv!)));
  }
  if (options?.authority) {
    filtered = filtered.filter((a) =>
      a.contracting_authority.toLowerCase().includes(options.authority!.toLowerCase()),
    );
  }

  const map = new Map<
    string,
    { supplier_name: string; supplier_vat: string | null; awards_won: number; total_value: number }
  >();

  for (const a of filtered) {
    const existing = map.get(a.supplier_name) || {
      supplier_name: a.supplier_name,
      supplier_vat: a.supplier_vat,
      awards_won: 0,
      total_value: 0,
    };
    existing.awards_won += 1;
    existing.total_value += a.award_value;
    map.set(a.supplier_name, existing);
  }

  const totalAwards = filtered.length || 1;
  let results: SupplierWinRate[] = Array.from(map.values()).map((s) => ({
    ...s,
    win_share: Number((s.awards_won / totalAwards).toFixed(3)),
  }));

  results.sort((a, b) => b.awards_won - a.awards_won);
  if (options?.topN) {
    results = results.slice(0, options.topN);
  }

  return results;
}

export function computeTrends(
  awards: AwardRecord[],
  interval: "month" | "quarter" | "year" = "month",
  options?: { cpv?: string; authority?: string },
): TrendSeries {
  let filtered = awards;
  if (options?.cpv) {
    filtered = filtered.filter((a) => a.cpv_codes.some((c) => c.includes(options.cpv!)));
  }
  if (options?.authority) {
    filtered = filtered.filter((a) =>
      a.contracting_authority.toLowerCase().includes(options.authority!.toLowerCase()),
    );
  }

  const buckets = new Map<string, number[]>();

  for (const a of filtered) {
    const d = new Date(a.award_date);
    let key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (interval === "quarter") {
      const q = Math.floor(d.getUTCMonth() / 3) + 1;
      key = `${d.getUTCFullYear()}-Q${q}`;
    } else if (interval === "year") {
      key = `${d.getUTCFullYear()}`;
    }

    const current = buckets.get(key) || [];
    current.push(a.award_value);
    buckets.set(key, current);
  }

  const sortedKeys = Array.from(buckets.keys()).sort();
  const points = sortedKeys.map((period) => {
    const vals = buckets.get(period)!;
    const count = vals.length;
    const total_value = vals.reduce((sum, v) => sum + v, 0);
    return {
      period,
      count,
      total_value,
      mean_value: Math.round(total_value / count),
    };
  });

  return { interval, points };
}

export function generateBidDraft(
  profile: CompanyProfile,
  tender: Tender,
): { draft: BidDraft; trace: TraceStep[] } {
  const draftId = `draft-${Date.now().toString(36)}`;
  const extractedAt = new Date().toISOString();

  const checklist: RequirementChecklist = {
    tender_id: tender.id,
    extracted_at: extractedAt,
    prompt_version: "v1.2",
    items: [
      {
        id: "req-1",
        category: "technical",
        text: "Demonstrated experience in high-availability distributed architecture and sensor telemetry protocols.",
        mandatory: true,
        citation: {
          tender_id: tender.id,
          locator: "Section 3.2.1, p. 14",
          snippet:
            "Tenderers must present verifiable track record of at least two (2) deployments involving real-time telemetry processing exceeding 50k events/sec.",
        },
      },
      {
        id: "req-2",
        category: "financial",
        text: "Minimum annual turnover requirement of 100% of the estimated contract value over the last 3 fiscal years.",
        mandatory: true,
        citation: {
          tender_id: tender.id,
          locator: "Section 2.4, p. 8",
          snippet:
            "Economic and financial standing: Total annual turnover must average at least the contract estimate for 2023-2025.",
        },
      },
      {
        id: "req-3",
        category: "legal",
        text: "Submission of European Single Procurement Document (ESPD) certifying absence of exclusion grounds.",
        mandatory: true,
        citation: {
          tender_id: tender.id,
          locator: "Section 1.3, p. 4",
          snippet:
            "Candidates must complete and sign Part III of the ESPD verifying compliance with Directive 2014/24/EU Article 57.",
        },
      },
    ],
  };

  const gapReport: GapReport = {
    company_id: profile.id,
    tender_id: tender.id,
    coverage_ratio: 0.85,
    items: [
      {
        requirement_id: "req-1",
        status: "met",
        evidence: "Past project references in smart road and municipal water telemetry platforms.",
        note: "Directly verified against company capacity tags.",
      },
      {
        requirement_id: "req-2",
        status: profile.annual_turnover >= (tender.budget || 0) ? "met" : "partial",
        evidence: `Annual turnover of ${profile.annual_turnover.toLocaleString()} EUR confirmed.`,
        note: "Meets primary turnover threshold.",
      },
      {
        requirement_id: "req-3",
        status: "met",
        evidence: "No exclusion flags present on company record.",
        note: "Ready for automated ESPD generation.",
      },
    ],
  };

  const sections: BidDraftSection[] = [
    {
      title: "Executive Summary & Bidder Qualifications",
      content: `**${profile.name}** is pleased to submit this proposal for **"${tender.title}"**.`,
      citations: [
        {
          tender_id: tender.id,
          locator: "Section 1.1, p. 3",
          snippet: "Scope of work includes end-to-end delivery, verification, and support.",
        },
      ],
      covers_requirements: ["req-1"],
      self_check_status: "ok",
    },
  ];

  const draft: BidDraft = {
    id: draftId,
    company_id: profile.id,
    tender_id: tender.id,
    sections,
    checklist,
    gap_report: gapReport,
    status: "needs_review",
    prompt_version: "v1.2",
    created_at: extractedAt,
    notice:
      "This is decision-support output. Mandatory human review is required before any submission.",
  };

  const trace: TraceStep[] = [
    {
      thought: "Analyzing tender requirements and extracting compliance clauses...",
      action: "extract_requirements",
      action_input: JSON.stringify({ tender_id: tender.id }),
      observation: "Extracted 3 requirement clauses with citations.",
    },
    {
      thought: "Evaluating bidder capabilities and turnover against tender requirements...",
      action: "analyze_gaps",
      action_input: JSON.stringify({ company_id: profile.id, tender_id: tender.id }),
      observation: "Identified 85% coverage.",
    },
  ];

  return { draft, trace };
}
