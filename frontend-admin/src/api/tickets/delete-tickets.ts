import { getAuthHeaders } from "../shared/get-auth-headers";

export async function deleteTickets(ticketId: string) {
  try {
    const res = await fetch("http://localhost:3000/tickets/delete-ticket", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ticketId })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('Failed to delete ticket');
    }

    const json = await res.json();
    return json.data; // { ticketId, deleted: true }
  } catch (err: unknown) {
    console.error("Error occurred while deleting ticket:", err);
    throw err;
  }
}
