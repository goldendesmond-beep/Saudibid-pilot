import { api } from "./client";
import type { Tender } from "./types";

export interface TenderFilters {
  status?: string;
  cpv?: string;
  work_category?: string;
  region?: string;
}

export const tendersApi = {
  list: (filters: TenderFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.cpv) params.set("cpv", filters.cpv);
    if (filters.work_category) params.set("work_category", filters.work_category);
    if (filters.region) params.set("region", filters.region);
    const qs = params.toString();
    return api.get<Tender[]>(`/tenders${qs ? `?${qs}` : ""}`);
  },
  ingestDoc: (tenderId: string) =>
    api.post<{ tender_id: string; chunks_ingested: number }>(`/tenders/${tenderId}/ingest-doc`),
  triggerIngest: () => api.post<{ ingested: number }>("/tenders/ingest"),
};
