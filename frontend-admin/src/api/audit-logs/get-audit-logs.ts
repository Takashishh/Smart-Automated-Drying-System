import { getAuthHeaders } from "../shared/get-auth-headers";

export async function getAuditLogs() {
  try {
    const res = await fetch("http://localhost:3000/audit-logs/get-audit-logs", {
      method: "GET",
      headers: getAuthHeaders() 
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('Failed to load audit logs');
    }

    const json = await res.json();
    console.log(json.data);
    return json.data ?? []; // ensure we always return an array
  } catch (err: unknown) {
    console.error("An error occurred in fetching the audit logs:", err);
    throw err;
  }
}
