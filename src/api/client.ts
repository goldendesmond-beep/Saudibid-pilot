export class ApiError extends Error {
  constructor(
    public readonly detail: string,
    public readonly status: number,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

function getBaseUrl(): string {
  const envBase = (import.meta.env.VITE_API_BASE as string | undefined)?.trim();
  if (!envBase) return "";
  // If running in browser and VITE_API_BASE points to localhost, ignore it to prevent
  // mixed-content or connection refused errors inside cloud iframe environments.
  if (typeof window !== "undefined" && (envBase.includes("localhost") || envBase.includes("127.0.0.1"))) {
    return "";
  }
  return envBase.replace(/\/+$/, "");
}

const BASE_URL = getBaseUrl();

function getCompanyId(): string | null {
  try {
    const raw = localStorage.getItem("bidpilot-company");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { companyId?: string } };
    return parsed.state?.companyId ?? null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const companyId = getCompanyId();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (companyId) headers["X-Company-Id"] = companyId;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const targetUrl = `${BASE_URL}${normalizedPath}`;

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      ...init,
      headers: { ...headers, ...(init?.headers as Record<string, string> | undefined) },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    throw new ApiError(`Unable to connect to procurement API (${message}). Check server status.`, 0);
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      // ignore parse error
    }
    throw new ApiError(detail, response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};
