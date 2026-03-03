import { getAuthHeaders } from "../shared/get-auth-headers";
import type { PaginatedResult } from "../users/get-users";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getEmailLogs(page: number = 1, limit: number = 10): Promise<PaginatedResult<any>> {
  const headers = await getAuthHeaders();
  const url = new URL(`${API_URL}/email-templates/get-email-logs`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error('Failed to fetch logs');
  }

  const data = await response.json();
  return {
    data: Array.isArray(data?.data) ? data.data : [],
    pagination: data?.pagination ?? {
      currentPage: page,
      pageSize: limit,
      totalItems: 0,
      totalPages: 0,
    },
  };
}
