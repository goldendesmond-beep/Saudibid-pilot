import { api } from "./client";

export interface CanonicalOpportunityData {
  id: string;
  title: string;
  title_ar?: string;
  entity: string;
  reference_number: string;
  city: string;
  region: string;
  work_category: string;
  description: string;
  publication_date: string;
  clarification_deadline?: string | null;
  closing_date?: string | null;
  budget_sar?: number | null;
  bid_bond_sar?: number | null;
  contractor_classification_req: string;
  required_experience_years?: number | null;
  mandatory_certifications: string[];
  required_documents: string[];
  public_contact: {
    procurement_email?: string;
    business_phone?: string;
    supplier_portal?: string;
  };
  opportunity_type: string;
  confidence_level: "CONFIRMED_OPPORTUNITY" | "POSSIBLE_OPPORTUNITY" | "MARKET_SIGNAL_ONLY";
  verification_status: string;
  primary_source_id: string;
  all_source_ids: string[];
  original_url: string;
  discovered_at: string;
  last_checked_at: string;
  raw_record_id: string;
}

export const opportunitiesApi = {
  list: (params?: {
    opportunity_type?: string;
    confidence_level?: string;
    source_id?: string;
    work_category?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.opportunity_type) q.set("opportunity_type", params.opportunity_type);
    if (params?.confidence_level) q.set("confidence_level", params.confidence_level);
    if (params?.source_id) q.set("source_id", params.source_id);
    if (params?.work_category) q.set("work_category", params.work_category);
    const qs = q.toString();
    return api.get<CanonicalOpportunityData[]>(`/opportunities${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => api.get<CanonicalOpportunityData>(`/opportunities/${id}`),
  getRaw: (id: string) => api.get<Record<string, unknown>>(`/opportunities/${id}/raw`),
  ingest: () => api.post<{ status: string; total_ingested: number }>("/opportunities/ingest"),
};
