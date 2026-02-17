import { getAuthHeaders } from "../shared/get-auth-headers";

export async function getTickets() {
  try {
    const headers = getAuthHeaders();
    const res = await fetch("http://localhost:3000/tickets/get-tickets", {
      method: "GET",
      headers
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('Failed to load tickets');
    }

    const json = await res.json();
    
    // Ensure we have data array
    const ticketsData = Array.isArray(json.data) ? json.data : [];

    return ticketsData.map((ticket: any) => ({
      id: ticket.id || ticket.ticketId || '',
      ticketId: ticket.id || ticket.ticketId || '',
      userId: ticket.userId || '',
      userName: ticket.userName || '',
      email: ticket.email || ticket.userEmail || '',
      description: ticket.description || '',
      issueType: ticket.issueType || 'other',
      notes: ticket.notes || '',
      status: ticket.status || 'Open',
      createdAt: ticket.createdAt
        ? new Date(ticket.createdAt)
        : new Date(),
      updatedAt: ticket.updatedAt
        ? new Date(ticket.updatedAt)
        : null
    }));
  } catch (err: unknown) {
    console.error("Error occurred in fetching tickets api:", err);
    throw err;
  }
}
