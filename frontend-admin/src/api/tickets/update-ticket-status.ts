import { getAuthHeaders } from "../shared/get-auth-headers";

export async function updateTicketStatus(
  ticketId: string,
  status: "Open" | "In-Progress" | "Resolved"
) {
  try {
    const res = await fetch("http://localhost:3000/tickets/update-ticket", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ticketId,
        status
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('Failed to update ticket');
    }

    const json = await res.json();
    return json.data; // { ticketId, status }
  } catch (err: unknown) {
    console.error("Error occurred while updating ticket status:", err);
    throw err;
  }
}
