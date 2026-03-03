const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export interface Ticket {
  ticketId: string;
  userName: string;
  userEmail: string;
  description: string;
  issueType: string;
  notes: string;
  status: 'Open' | 'In-Progress' | 'Resolved';
  createdDate: string;
  updatedAt: string | null;
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export async function getUserTickets(userId: string, page: number = 1, limit: number = 10): Promise<PaginatedResult<Ticket>> {
  const url = new URL(`${API_URL}/tickets/get-tickets`);
  url.searchParams.set('userId', userId);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Unable to fetch tickets');
  }

  const result = await res.json();

  return {
    data: Array.isArray(result?.data) ? result.data : [],
    pagination: result?.pagination ?? {
      currentPage: page,
      pageSize: limit,
      totalItems: 0,
      totalPages: 0,
    },
  };
}
