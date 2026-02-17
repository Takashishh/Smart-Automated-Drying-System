import { getAuthHeaders } from "../shared/get-auth-headers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getEmailLogs() {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/email-templates/get-email-logs`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error('Failed to fetch logs');
  }

  const data = await response.json();
  return data.data;
}
