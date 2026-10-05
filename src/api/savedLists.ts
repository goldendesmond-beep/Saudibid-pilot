import { api } from "./client";

export interface SavedListModel {
  id: string;
  company_id: string;
  name: string;
  notes: string;
  opportunity_ids: string[];
  created_at: string;
  updated_at: string;
  original_snapshot_id?: string | null;
}

export const savedListsApi = {
  list: (companyId?: string) => {
    const q = companyId ? `?company_id=${companyId}` : "";
    return api.get<SavedListModel[]>(`/saved-lists${q}`);
  },
  get: (id: string) => api.get<SavedListModel>(`/saved-lists/${id}`),
  create: (data: {
    name: string;
    notes?: string;
    opportunity_ids?: string[];
    company_id?: string;
    original_snapshot_id?: string;
  }) => api.post<SavedListModel>("/saved-lists", data),
  update: (id: string, data: Partial<{ name: string; notes: string; opportunity_ids: string[] }>) =>
    api.put<SavedListModel>(`/saved-lists/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean; deleted_id: string }>(`/saved-lists/${id}`),
};
