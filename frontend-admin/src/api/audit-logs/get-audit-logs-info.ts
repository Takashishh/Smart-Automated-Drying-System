import { getAuthHeaders } from "../shared/get-auth-headers";

export async function getAuditLogsInfo(auditId: string) {
  try {
    const res = await fetch(
      `http://localhost:3000/audit-logs/get-audit-info/${auditId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('Failed to load audit details');
    }

    const json = await res.json();
    return json.data || null;

  } catch (err: unknown) {
    console.error("An error occurred in fetching the audit log:", err);
    throw err;
  }
}