import React, { useMemo, useState } from 'react';
import { createTicket } from '../../api/tickets/create-ticket';
import { AlertCircle, CheckCircle, LifeBuoy, Send, ShieldCheck, Ticket, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TicketsPageProps {
  user: {
    uid?: string;
    displayName?: string;
    email?: string;
  } | null;
  onNavigate?: (page: string) => void;
}

const ISSUE_TYPES = ['Sensor', 'Software', 'Hardware'];

export function TicketsPage({ user, onNavigate }: TicketsPageProps) {
  const [issueType, setIssueType] = useState<string>(ISSUE_TYPES[0]);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const userId = user?.uid ?? '';

  const accountLabel = useMemo(() => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email;
    return 'Your account';
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setErrorMessage('We could not find your account. Please sign in again.');
      setStatus('error');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setStatus('submitting');
    setErrorMessage('');

    try {
      await createTicket({
        userId,
        description,
        issueType,
        notes
      });
      setStatus('success');
      setDescription('');
      setNotes('');
      setIssueType(ISSUE_TYPES[0]);
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Couldn\'t submit the ticket. Please try again.');
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };

  const isSubmitting = status === 'submitting';

  return (
    <div className="pt-24 pb-16 bg-gradient-to-b from-blue-50 via-white to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur rounded-3xl border border-blue-100 shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="p-8 sm:p-10 lg:p-12 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 rounded-full text-sm">
                  <Ticket size={16} />
                  Create a support ticket
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                  Describe the issue and our team will jump on it.
                </h1>
                <p className="text-white/80 text-lg leading-relaxed">
                  Tell us what is happening with your Smart Rack setup. Choose the area that best
                  fits (sensor, software, or hardware) and add a short description. We will route it to the
                  right specialist.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[{
                    title: 'Faster triage',
                    icon: <Zap className="w-5 h-5" />,
                    desc: 'Clear categories help us send your ticket to the right expert.'
                  }, {
                    title: 'Account linked',
                    icon: <ShieldCheck className="w-5 h-5" />,
                    desc: 'We attach your account automatically so we can verify devices.'
                  }].map(item => (
                    <div key={item.title} className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                      <div className="p-2 bg-white/20 rounded-xl text-white">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-white/80">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="p-8 sm:p-10 lg:p-12 bg-white">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Support ticket</p>
                  <h2 className="text-xl font-semibold text-gray-900">Submit a new issue</h2>
                </div>
              </div>

              <div className="mb-6 flex flex-col gap-2 p-4 rounded-xl border border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-600">Submitting as</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{accountLabel}</p>
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Issue type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {ISSUE_TYPES.map(type => {
                      const isActive = issueType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setIssueType(type)}
                          className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                            isActive
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{type}</span>
                            {isActive && <CheckCircle className="w-5 h-5 text-blue-600" />}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Issues related to {type.toLowerCase()}.</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                  <textarea
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Share what you are seeing, any error codes, and when it started."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Additional notes <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Any additional information that might help us resolve this faster."
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>We attach your user ID automatically.</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <span>{status === 'success' ? 'Ticket sent' : 'Ready to send'}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || status === 'success'}
                  className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99] ${
                    status === 'success'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle size={18} />
                      <span>Ticket submitted</span>
                    </>
                  ) : (
                    <>
                      <span>Submit ticket</span>
                      <Send size={18} />
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm flex items-center gap-2"
                    >
                      <AlertCircle size={16} />
                      <span>{errorMessage || 'Unable to submit the ticket. Please try again.'}</span>
                    </motion.div>
                  )}
                  {status === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="space-y-3"
                    >
                      <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm flex items-center gap-2">
                        <CheckCircle size={16} />
                        <span>Thanks! We logged your issue and will update you soon.</span>
                      </div>
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate('view-tickets')}
                          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all flex items-center justify-center gap-2"
                        >
                          <Ticket size={18} />
                          <span>View My Tickets</span>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCancelSubmit}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Confirm your ticket</h3>
                </div>
                <button
                  onClick={handleCancelSubmit}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-gray-600 mb-6">Please review your ticket details before submitting:</p>

              <div className="space-y-4 mb-8 bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Issue Type</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{issueType}</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</p>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">{description}</p>
                </div>

                {notes && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Additional Notes</p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">{notes}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted As</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{accountLabel}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelSubmit}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  disabled={status === 'submitting'}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === 'submitting' ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
