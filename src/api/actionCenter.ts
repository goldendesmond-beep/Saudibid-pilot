/**
 * Unified Action Center API Client (Stage 10).
 */

import { api } from "./client";

export interface ActionCenterItemModel {
  id: string;
  priority: "ACTION_NOW" | "ACTION_THIS_WEEK" | "MONITOR" | "LOW_PRIORITY";
  category:
    | "PREQUAL_DOCUMENT"
    | "REGISTRATION_DEADLINE"
    | "NEW_AWARD"
    | "CONTRACTOR_PORTAL"
    | "PROPOSAL_DEADLINE"
    | "BOQ_UNPRICED"
    | "FOLLOW_UP_DUE";
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  tenant_id: string;
  due_date?: string | null;
  is_overdue: boolean;
  target_type: "CONTRACTOR" | "OPPORTUNITY" | "PACKAGE" | "PROPOSAL" | "DOCUMENT" | "BOQ";
  target_id: string;
  target_name: string;
  deep_link: string;
  action_cta_en: string;
  action_cta_ar: string;
  created_at: string;
}

export interface ActionCenterSummary {
  total_actions: number;
  action_now_count: number;
  action_this_week_count: number;
  monitor_count: number;
  low_priority_count: number;
  overdue_count: number;
  last_evaluated: string;
}

export const actionCenterApi = {
  getActionItems: async (priority?: string): Promise<ActionCenterItemModel[]> => {
    const q = priority && priority !== "ALL" ? `?priority=${priority}` : "";
    return api.get<ActionCenterItemModel[]>(`/action-center/items${q}`);
  },

  getActionSummary: async (): Promise<ActionCenterSummary> => {
    return api.get<ActionCenterSummary>("/action-center/summary");
  },
};
