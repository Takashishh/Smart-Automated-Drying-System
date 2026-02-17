import { getAuthHeaders } from "../shared/get-auth-headers";

export async function createTicket(
  userId: string,
  description: string,
  issueType: string,
  notes: string
) {
  try {
    const res = await fetch("http://localhost:3000/tickets/create-ticket", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId,
        description,
        issueType,
        notes
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('Failed to create ticket');
    }

    const json = await res.json();
    return json.data; // { ticketId, status }
  } catch (err: unknown) {
    console.error("Error occurred while creating ticket:", err);
    throw err;
  }
}
