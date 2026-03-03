import { getAuthHeaders } from "../shared/get-auth-headers";
import type { PaginatedResult } from "../users/get-users";

export async function getAuditLogs(page: number = 1, limit: number = 10): Promise<PaginatedResult<any>> {
  try {
    const url = new URL("http://localhost:3000/audit-logs/get-audit-logs");
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders() 
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('Failed to load audit logs');
    }

    const json = await res.json();

    return {
      data: Array.isArray(json?.data) ? json.data : [],
      pagination: json?.pagination ?? {
        currentPage: page,
        pageSize: limit,
        totalItems: 0,
        totalPages: 0,
      },
    };
  } catch (err: unknown) {
    console.error("An error occurred in fetching the audit logs:", err);
    throw err;
  }
}
