import { getAuthHeaders } from "../shared/get-auth-headers";
import type { PaginatedResult } from "../users/get-users";

export async function getTickets(page: number = 1, limit: number = 10): Promise<PaginatedResult<any>> {
  try {
    const headers = getAuthHeaders();
    const url = new URL("http://localhost:3000/tickets/get-tickets");
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
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

    return {
      data: ticketsData.map((ticket: any) => ({
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
      })),
      pagination: json?.pagination ?? {
        currentPage: page,
        pageSize: limit,
        totalItems: 0,
        totalPages: 0,
      },
    };
  } catch (err: unknown) {
    console.error("Error occurred in fetching tickets api:", err);
    throw err;
  }
}
