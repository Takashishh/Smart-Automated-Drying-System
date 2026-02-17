import React, { useState, useEffect } from 'react';
import { getUserTickets, type Ticket } from '../../api/tickets/get-user-tickets';
import { Clock, CheckCircle2, AlertCircle, Loader2, RefreshCw, ListChecks, Search, Ticket as TicketIcon, Calendar, Activity, MessageSquare, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ViewTicketsPageProps {
  user: {
    uid?: string;
    displayName?: string;
    email?: string;
  } | null;
}

export function ViewTicketsPage({ user }: ViewTicketsPageProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'Open' | 'In-Progress' | 'Resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    if (!user?.uid) {
      setError('Please sign in to view your tickets');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userTickets = await getUserTickets(user.uid);
      // Sort by creation date (newest first)
      const sortedTickets = userTickets.sort((a, b) => 
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );
      setTickets(sortedTickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn\'t load tickets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user?.uid]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <AlertCircle className="w-5 h-5" />;
      case 'In-Progress':
        return <Clock className="w-5 h-5" />;
      case 'Resolved':
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <TicketIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return {
          bg: 'bg-gradient-to-br from-blue-100 to-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-300',
          badge: 'bg-red-500',
          ring: 'ring-blue-100'
        };
      case 'In-Progress':
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-white',
          text: 'text-blue-700',
          border: 'border-blue-200',
          badge: 'bg-orange-500',
          ring: 'ring-blue-100'
        };
      case 'Resolved':
        return {
          bg: 'bg-gradient-to-br from-blue-100 to-white',
          text: 'text-blue-700',
          border: 'border-blue-300',
          badge: 'bg-green-500',
          ring: 'ring-blue-100'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-white',
          text: 'text-blue-700',
          border: 'border-blue-200',
          badge: 'bg-blue-500',
          ring: 'ring-blue-100'
        };
    }
  };

  const getIssueTypeIcon = (issueType: string) => {
    return <Tag className="w-4 h-4" />;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status === filter;
    const matchesSearch = searchQuery === '' || 
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.issueType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200">
                  <ListChecks className="w-7 h-7" />
                </div>
                {tickets.filter(t => t.status === 'Open').length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                    {tickets.filter(t => t.status === 'Open').length}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  My Support Tickets
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Track and manage your submitted issues
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 w-5 h-5 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by ticket ID, description, or issue type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'Open', 'In-Progress', 'Resolved'] as const).map((status) => {
                const count = status === 'all' ? tickets.length : tickets.filter(t => t.status === status).length;
                return (
                    <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`relative px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                      filter === status
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 scale-105'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:scale-105'
                    }`}
                  >
                    <span>{status === 'all' ? 'All' : status}</span>
                    {count > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                        filter === status ? 'bg-white/20' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchTickets}
              disabled={isLoading}
              className="px-5 py-3 rounded-xl bg-white border-2 border-blue-200 text-blue-700 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2 disabled:opacity-50 font-medium group"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading your tickets...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-center gap-3 text-blue-700"
          >
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Unable to load tickets</p>
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredTickets.length === 0 && tickets.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border-2 border-dashed border-blue-200 shadow-sm p-12 text-center"
          >
            <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 mb-6">
              <TicketIcon className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No tickets yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't submitted any support tickets. If you encounter any issues, feel free to create a ticket.
            </p>
          </motion.div>
        )}

        {/* No Results State */}
        {!isLoading && !error && filteredTickets.length === 0 && tickets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border-2 border-dashed border-blue-200 shadow-sm p-12 text-center"
          >
            <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-400 mb-6">
              <Search className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No tickets found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search query to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-200"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Tickets List */}
        {!isLoading && !error && filteredTickets.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredTickets.map((ticket, index) => {
                const colors = getStatusColor(ticket.status);
                return (
                  <motion.div
                    key={ticket.ticketId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="group relative overflow-hidden rounded-2xl"
                  >
                    {/* Status indicator bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${colors.badge}`} />
                    
                    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md hover:shadow-xl transition-all overflow-hidden">
                      <div className="p-6">
                        {/* Header Row */}
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            {/* Status Badge */}
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${colors.border} ${colors.bg} ${colors.text} font-semibold text-sm shadow-sm`}>
                              {getStatusIcon(ticket.status)}
                              <span>{ticket.status}</span>
                            </div>

                            {/* Issue Type Badge */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl text-sm font-medium text-blue-700">
                              {getIssueTypeIcon(ticket.issueType)}
                              <span>{ticket.issueType}</span>
                            </div>
                          </div>

                          {/* Ticket ID */}
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                            <TicketIcon className="w-3.5 h-3.5 text-blue-500" />
                            <code className="text-xs text-blue-700 font-mono font-semibold">
                              #{ticket.ticketId.slice(0, 12)}
                            </code>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                            {ticket.description}
                          </h3>
                          
                          {/* Notes */}
                          {ticket.notes && (
                            <div className="flex gap-2 mt-3">
                              <MessageSquare className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                              <p className="text-gray-600 text-sm leading-relaxed">{ticket.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Footer with dates */}
                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="p-1.5 rounded-lg bg-blue-50">
                              <Calendar className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Created</span>
                              <p className="font-medium">{getRelativeTime(ticket.createdDate)}</p>
                            </div>
                          </div>

                          {ticket.updatedAt && ticket.updatedAt !== ticket.createdDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="p-1.5 rounded-lg bg-blue-50">
                                <RefreshCw className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <span className="text-xs text-gray-500">Updated</span>
                                <p className="font-medium">{getRelativeTime(ticket.updatedAt)}</p>
                              </div>
                            </div>
                          )}

                          {/* Time indicator */}
                          <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(ticket.createdDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Summary Stats */}
        {!isLoading && !error && tickets.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4"
          >
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <TicketIcon className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <p className="text-3xl font-bold">{tickets.length}</p>
                  <p className="text-sm text-blue-100">Total Tickets</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <p className="text-3xl font-bold">
                    {tickets.filter(t => t.status === 'Open').length}
                  </p>
                  <p className="text-sm text-blue-100">Open</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <p className="text-3xl font-bold">
                    {tickets.filter(t => t.status === 'In-Progress').length}
                  </p>
                  <p className="text-sm text-blue-100">In Progress</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <p className="text-3xl font-bold">
                    {tickets.filter(t => t.status === 'Resolved').length}
                  </p>
                  <p className="text-sm text-blue-100">Resolved</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
