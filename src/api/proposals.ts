/**
 * Proposal Workspace & BOQ Assistant API Client (Stage 10).
 */

import { api } from "./client";

export interface BOQItemModel {
  item_number: string;
  description: string;
  description_ar?: string;
  unit: string;
  quantity: number;
  unit_rate: number | null;
  total: number | null;
  rate_source: "USER_ENTERED" | "IMPORTED" | "VERIFIED_SOURCE" | "ESTIMATED" | "UNKNOWN";
  trade_category: string;
  notes?: string;
  is_price_missing: boolean;
}

export interface BOQSheetModel {
  id: string;
  tenant_id: string;
  proposal_id?: string;
  package_id?: string;
  title: string;
  title_ar?: string;
  items: BOQItemModel[];
  subtotal: number;
  overhead_percent: number;
  overhead_amount: number;
  contingency_percent: number;
  contingency_amount: number;
  margin_percent: number;
  margin_amount: number;
  vat_percent: number;
  vat_amount: number;
  grand_total: number;
  unpriced_items_count: number;
  pricing_completeness_percentage: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalModel {
  id: string;
  title: string;
  title_ar?: string;
  main_contractor_id: string;
  main_contractor_name: string;
  main_contractor_name_ar?: string;
  project_name: string;
  trade_package_name: string;
  tenant_id: string;
  tender_id?: string;
  award_id?: string;
  trade_package_id?: string;
  registration_id?: string;
  dossier_id?: string;
  boq_id?: string;
  status:
    | "DRAFT"
    | "IN_REVIEW"
    | "READY"
    | "SUBMITTED"
    | "CLARIFICATION"
    | "REVISED"
    | "AWARDED"
    | "LOST"
    | "CANCELLED";
  bid_decision: "BID" | "CONDITIONAL_BID" | "REVIEW" | "NO_BID";
  bid_decision_score: number;
  recommendation?: string;
  risks?: string[];
  missing_information?: string[];
  bid_decision_factors: Array<{
    factor_name: string;
    weight_percent: number;
    score: number;
    status: string;
    explanation: string;
  }>;
  submission_deadline?: string;
  submission_reference?: string;
  submitted_at?: string;
  boq_grand_total_sar?: number;
  assigned_lead: string;
  notes?: string;
  provenance?: {
    source?: string;
    official_tender_no?: string;
    verified_award_value_sar?: number;
    subcontract_estimate_sar?: number;
  };
  created_at: string;
  updated_at: string;
}

export const proposalApi = {
  getProposals: async (): Promise<ProposalModel[]> => {
    return api.get<ProposalModel[]>("/proposals");
  },

  getProposal: async (id: string): Promise<ProposalModel> => {
    return api.get<ProposalModel>(`/proposals/${id}`);
  },

  updateProposalStatus: async (
    id: string,
    payload: {
      status: string;
      submission_reference?: string;
      notes?: string;
    }
  ): Promise<ProposalModel> => {
    return api.patch<ProposalModel>(`/proposals/${id}/status`, payload);
  },

  getBOQ: async (id: string): Promise<BOQSheetModel> => {
    return api.get<BOQSheetModel>(`/boqs/${id}`);
  },

  updateBOQItem: async (
    boqId: string,
    payload: {
      item_number: string;
      unit_rate: number | null;
      quantity?: number;
      notes?: string;
      rate_source?: string;
    }
  ): Promise<BOQSheetModel> => {
    return api.patch<BOQSheetModel>(`/boqs/${boqId}/item`, payload);
  },
};
