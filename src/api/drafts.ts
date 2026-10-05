import { api } from "./client";
import type { BidDraft, TraceStep } from "./types";

export const draftsApi = {
  run: (companyId: string, tenderId: string) =>
    api.post<BidDraft>("/drafts/run", { company_id: companyId, tender_id: tenderId }),
  get: (id: string) => api.get<BidDraft>(`/drafts/${id}`),
  getTrace: (id: string) => api.get<TraceStep[]>(`/drafts/${id}/trace`),
};
