import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TicketStatusBadge } from '../components/tickets/TicketStatusBadge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';
import { Trash2, CheckCircle, AlertCircle, Shield, Calendar, ArrowUpDown, Clock } from 'lucide-react';
import { TicketStatus } from '../lib/types';
import { toast } from 'sonner';
export function TicketsPage() {
  const {
    tickets,
    loading,
    error,
    updateStatus,
    deleteTicket
  } = useTickets();
  const {
    isSuperAdmin
  } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortField, setSortField] = useState<'created' | 'updated'>('created');
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [statusChangeAction, setStatusChangeAction] = useState<{
    ticketId: string;
    status: TicketStatus;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const filteredAndSortedTickets = useMemo(() => {
    const getDateRange = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      switch (dateFilter) {
        case 'today':
          return {
            start: today,
            end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          };
        case 'week':
          {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            return {
              start: weekStart,
              end: weekEnd
            };
          }
        case 'month':
          {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return {
              start: monthStart,
              end: monthEnd
            };
          }
        case 'custom':
          if (customStartDate && customEndDate) {
            return {
              start: new Date(customStartDate),
              end: new Date(new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000)
            };
          }
          return null;
        default:
          return null;
      }
    };
    let filtered = tickets.filter(ticket => {
      // Status filter
      if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          ticket.description.toLowerCase().includes(query) ||
          ticket.userName.toLowerCase().includes(query) ||
          ticket.userEmail.toLowerCase().includes(query) ||
          ticket.issueType.toLowerCase().includes(query) ||
          ticket.ticketId.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      return true;
    });

    const dateRange = getDateRange();
    if (dateRange) {
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.createdDate);
        return ticketDate >= dateRange.start && ticketDate < dateRange.end;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      const dateA = sortField === 'created' 
        ? new Date(a.createdDate).getTime()
        : new Date(a.resolvedDate || a.createdDate).getTime();
      const dateB = sortField === 'created'
        ? new Date(b.createdDate).getTime()
        : new Date(b.resolvedDate || b.createdDate).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return sorted;
  }, [tickets, statusFilter, dateFilter, customStartDate, customEndDate, sortOrder, sortField, searchQuery]);

  const statusLabel = (s: TicketStatus) => s === 'unresolved' ? 'Open' : s === 'resolving' ? 'In Progress' : 'Resolved';

  const handleStatusUpdate = async () => {
    if (!statusChangeAction) return;
    // capture and close dialog for snappy UI
    const action = statusChangeAction;
    setStatusChangeAction(null);
    setIsProcessing(true);
    try {
      await updateStatus(action.ticketId, action.status);
      toast.success(`Ticket marked as ${statusLabel(action.status)}`);
    } catch (err: unknown) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleDelete = async () => {
    if (!ticketToDelete) return;
    const id = ticketToDelete;
    // close dialog immediately so UI doesn't await the network
    setTicketToDelete(null);
    setIsProcessing(true);
    try {
      await deleteTicket(id);
      toast.success('Ticket removed');
    } catch (err: unknown) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate stats
  const ticketStats = useMemo(() => {
    const total = tickets.length;
    const unresolved = tickets.filter(t => t.status === 'unresolved').length;
    const resolving = tickets.filter(t => t.status === 'resolving').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    return { total, unresolved, resolving, resolved };
  }, [tickets]);

  // Minimal accent color per status
  const statusAccent = (status: TicketStatus) => {
    switch (status) {
      case 'unresolved':
        return 'bg-red-500';
      case 'resolving':
        return 'bg-amber-500';
      case 'resolved':
        return 'bg-emerald-600';
      default:
        return 'bg-gray-300';
    }
  };

  // Status pill component
  const StatusPill = ({
    label,
    value,
    count,
    active,
    onClick,
  }: { label: string; value: string; count: number; active: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm transition-colors ${
        active ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'bg-white text-gray-700 hover:bg-blue-50 border-gray-200 hover:border-blue-300 hover:text-blue-700'
      }`}
    >
      <span className="font-medium">{label}</span>
      <span className={`inline-flex items-center justify-center rounded-full text-[10px] sm:text-xs font-semibold px-2 py-0.5 ${
        active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
      }`}>{count}</span>
    </button>
  );
  return <AdminLayout title="Support Tickets">

      {/* Filters + Status pills */}
      <Card className="mb-4 sm:mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <StatusPill label="All" value="all" count={ticketStats.total} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
              <StatusPill label="Open" value="unresolved" count={ticketStats.unresolved} active={statusFilter === 'unresolved'} onClick={() => setStatusFilter('unresolved')} />
              <StatusPill label="In Progress" value="resolving" count={ticketStats.resolving} active={statusFilter === 'resolving'} onClick={() => setStatusFilter('resolving')} />
              <StatusPill label="Resolved" value="resolved" count={ticketStats.resolved} active={statusFilter === 'resolved'} onClick={() => setStatusFilter('resolved')} />
            </div>
            <div className="w-full sm:w-auto">
              <Input 
                label="Search" 
                placeholder="Search name, email, description..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Select label="Date Range" options={[
              { value: 'all', label: 'All Time' },
              { value: 'today', label: 'Today' },
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'custom', label: 'Custom Range' },
            ]} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="mb-0" />

            {dateFilter === 'custom' && (
              <>
                <Input label="Start Date" type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="mb-0" />
                <Input label="End Date" type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="mb-0" />
              </>
            )}

            <Select 
              label="Sort By" 
              options={[
                { value: 'created', label: 'Date Created' },
                { value: 'updated', label: 'Date Updated' },
              ]} 
              value={sortField} 
              onChange={(e) => setSortField(e.target.value as 'created' | 'updated')} 
              className="mb-0" 
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <Button 
                variant="outline" 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} 
                className="w-full h-10" 
                leftIcon={<ArrowUpDown className="h-4 w-4" />}
              >
                <span className="hidden sm:inline">
                  {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                </span>
                <span className="sm:hidden">
                  {sortOrder === 'asc' ? 'Oldest' : 'Newest'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Result Counter */}
      <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{filteredAndSortedTickets.length}</span> of <span className="font-semibold text-gray-900">{tickets.length}</span> tickets
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 p-4 rounded-lg"
        >
          <p className="text-red-800 text-sm font-medium">
            <strong>Error:</strong> {error}
          </p>
          <p className="text-red-700 text-xs mt-2">Please check your authentication and try again.</p>
        </motion.div>
      )}

      {/* Tickets List */}
      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/5 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-11/12" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-2" />
            <p className="text-sm sm:text-base text-gray-700">Couldn\'t load the tickets</p>
            <p className="text-xs sm:text-sm text-gray-500">{error}</p>
          </motion.div>
        ) : filteredAndSortedTickets.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <Calendar className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm sm:text-base text-gray-700">No tickets found</p>
            <p className="text-xs sm:text-sm text-gray-500">Adjust your filters or search</p>
          </motion.div>
        ) : (
          filteredAndSortedTickets.map((ticket, index) => (
            <motion.div key={ticket.ticketId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.02 }}>
              <Card className="overflow-hidden">
                <div className="relative flex flex-col gap-3 p-4">
                  {/* left accent */}
                  <div className={`absolute inset-y-0 left-0 w-1 ${statusAccent(ticket.status)}`} />

                  {/* Top row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <TicketStatusBadge status={ticket.status} />
                      <span className="text-[11px] sm:text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {ticket.issueType || 'General'}
                      </span>
                      {ticket.ticketId && (
                        <span className="text-[11px] sm:text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
                          #{ticket.ticketId.slice(0, 12)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end text-right gap-1">
                      <span className="text-[11px] sm:text-xs text-gray-500 inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {ticket.createdDate ? new Date(ticket.createdDate).toLocaleDateString() : 'N/A'}
                      </span>
                      {(ticket.userName || ticket.userEmail) && (
                        <div className="text-[11px] sm:text-xs text-gray-700">
                          {ticket.userName && (
                            <span className="font-medium text-gray-900">{ticket.userName}</span>
                          )}
                          {ticket.userName && ticket.userEmail && ' · '}
                          {ticket.userEmail && (
                            <a href={`mailto:${ticket.userEmail}`} className="text-blue-600 hover:underline">{ticket.userEmail}</a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle row */}
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <p className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2">
                        {ticket.description || 'No description provided'}
                      </p>
                      {ticket.notes && (
                        <p className="mt-2 text-xs text-gray-600 line-clamp-2"><span className="font-semibold text-gray-700">Notes:</span> {ticket.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Bottom row actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                    {ticket.status === 'unresolved' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setStatusChangeAction({ ticketId: ticket.ticketId, status: 'resolving' })}
                        className="flex-1 sm:flex-none justify-center"
                        leftIcon={<AlertCircle className="h-4 w-4" />}
                      >
                        Start Work
                      </Button>
                    )}
                    {ticket.status === 'resolving' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setStatusChangeAction({ ticketId: ticket.ticketId, status: 'resolved' })}
                        className="flex-1 sm:flex-none justify-center"
                        leftIcon={<CheckCircle className="h-4 w-4" />}
                      >
                        Resolve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setTicketToDelete(ticket.ticketId)}
                      className="flex-1 sm:flex-none justify-center"
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      Delete
                    </Button>
                    {ticket.resolvedDate && ticket.resolvedDate !== ticket.createdDate && (
                      <span className="ml-auto text-[11px] sm:text-xs text-gray-500 inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Updated: {new Date(ticket.resolvedDate).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Modals */}
      <ConfirmDialog 
        isOpen={!!statusChangeAction} 
        onClose={() => setStatusChangeAction(null)} 
        onConfirm={handleStatusUpdate} 
        title={statusChangeAction?.status === 'resolving' ? 'Start Work on Ticket' : 'Resolve Ticket'} 
        message={
          statusChangeAction?.status === 'resolving'
            ? 'Move this ticket to In Progress? This will be logged in the audit trail.'
            : 'Mark this ticket as Resolved? This will be logged in the audit trail.'
        } 
        confirmText={statusChangeAction?.status === 'resolving' ? 'Start Work' : 'Resolve'} 
        variant="primary" 
        isLoading={isProcessing} 
      />

      <ConfirmDialog 
        isOpen={!!ticketToDelete} 
        onClose={() => setTicketToDelete(null)} 
        onConfirm={handleDelete} 
        title="Delete Ticket" 
        message={`This will permanently delete ticket ${ticketToDelete ? '#'+ticketToDelete.slice(0,12) : ''}. This cannot be undone and will be logged in the audit trail.`} 
        confirmText="Delete Ticket" 
        variant="danger" 
        isLoading={isProcessing} 
      />
    </AdminLayout>;
}