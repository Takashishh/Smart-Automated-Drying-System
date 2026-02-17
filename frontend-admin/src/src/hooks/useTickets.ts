import { useState, useEffect } from 'react';
import { Ticket, TicketStatus } from '../lib/types';
import { getTickets } from '../../api/tickets/get-tickets';
import { updateTicketStatus } from '../../api/tickets/update-ticket-status';
import { deleteTickets } from '../../api/tickets/delete-tickets';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTickets();
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error('Invalid tickets data format:', data);
          setTickets([]);
          return;
        }

        // Filter out invalid tickets and map Firebase data to Ticket interface
        const mappedTickets: Ticket[] = data
          .filter((ticket: any) => ticket && ticket.id)
          .map((ticket: any) => {
            // Map Firebase status to our TicketStatus type
            let status: TicketStatus = 'unresolved';
            if (ticket.status === 'Open') status = 'unresolved';
            else if (ticket.status === 'In-Progress') status = 'resolving';
            else if (ticket.status === 'Resolved') status = 'resolved';

            // Ensure ticket ID is a string
            const ticketId = String(ticket.id || ticket.ticketId || '');
            if (!ticketId) {
              console.warn('Ticket without ID:', ticket);
              return null;
            }

            return {
              ticketId,
              userId: ticket.userId || '',
              userName: ticket.userName || 'Unknown User',
              userEmail: ticket.email || '',
              issueType: (ticket.issueType || 'other').toLowerCase() as any,
              description: ticket.description || '',
              status,
              createdDate: ticket.createdAt instanceof Date 
                ? ticket.createdAt.toISOString() 
                : (String(ticket.createdAt) || new Date().toISOString()),
              resolvedDate: ticket.updatedAt instanceof Date 
                ? ticket.updatedAt.toISOString() 
                : (ticket.updatedAt ? String(ticket.updatedAt) : null),
              notes: ticket.notes || ''
            };
          })
          .filter((ticket: Ticket | null): ticket is Ticket => ticket !== null);

        setTickets(mappedTickets);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch tickets';
        console.error('Failed to fetch tickets:', err);
        setError(errorMsg);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchTickets();

    // Poll for new tickets every 30 seconds
    const pollInterval = setInterval(() => {
      fetchTickets();
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, []);

  const updateStatus = async (ticketId: string, status: TicketStatus) => {
    try {
      // Map our status to Firebase status
      const firebaseStatus = status === 'unresolved' 
        ? 'Open' 
        : status === 'resolving' 
        ? 'In-Progress' 
        : 'Resolved';

      await updateTicketStatus(ticketId, firebaseStatus);

      // Update local state
      setTickets(prev => prev.map(t => {
        if (t.ticketId === ticketId) {
          return {
            ...t,
            status,
            resolvedDate: status === 'resolved' ? new Date().toISOString() : t.resolvedDate
          };
        }
        return t;
      }));
    } catch (err) {
      console.error('Failed to update ticket status:', err);
      throw err;
    }
  };

  const deleteTicket = async (ticketId: string) => {
    try {
      await deleteTickets(ticketId);
      setTickets(prev => prev.filter(t => t.ticketId !== ticketId));
    } catch (err) {
      console.error('Failed to delete ticket:', err);
      throw err;
    }
  };

  return {
    tickets,
    loading,
    error,
    updateStatus,
    deleteTicket
  };
}