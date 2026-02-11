import React, { useState } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Combobox } from '../components/ui/Combobox';
import { useEmails } from '../hooks/useEmails';
import { Mail, Send, History, ChevronRight, Calendar, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getTickets } from '../../api/tickets/get-tickets';
import type { Ticket, EmailLog } from '../lib/types';
export function EmailTemplatesPage() {
  const {
    templates,
    logs,
    recipients,
    loading,
    sendEmail
  } = useEmails();
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLogDetail, setSelectedLogDetail] = useState<EmailLog | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientError, setRecipientError] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState('');
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Extract variables from template content
  const getTemplateVariables = (content: string): string[] => {
    const matches = content.match(/\{(\w+)\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.slice(1, -1)))];
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate);
  const templateVars = currentTemplate ? getTemplateVariables(currentTemplate.content) : [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate recipient is registered
    const isValidRecipient = recipients.some(r => r.email === recipient);
    if (!isValidRecipient) {
      setRecipientError('Please select a registered user or admin');
      toast.error('Invalid recipient email');
      return;
    }
    
    setRecipientError('');
    setIsSending(true);
    try {
      await sendEmail(recipient, selectedTemplate, variables);
      toast.success('Email sent successfully');
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setSelectedTicket(''); // Reset ticket selection when template changes
    
    // Preserve the name variable if recipient is selected
    if (recipientName) {
      setVariables({ name: recipientName });
    } else {
      setVariables({});
    }
  };

  const handleCloseModal = () => {
    setIsSendModalOpen(false);
    setSelectedTemplate('');
    setRecipient('');
    setRecipientName('');
    setRecipientError('');
    setVariables({});
    setUserTickets([]);
    setSelectedTicket('');
  };

  const handleRecipientChange = async (email: string) => {
    setRecipient(email);
    setRecipientError('');
    setSelectedTicket('');
    
    // Find the recipient and set their name
    const selectedRecipient = recipients.find(r => r.email === email);
    if (selectedRecipient) {
      setRecipientName(selectedRecipient.name);
      // Auto-fill the name variable if it exists in the template
      setVariables(prev => ({
        ...prev,
        name: selectedRecipient.name
      }));

      // Fetch tickets for this user
      if (selectedRecipient.type === 'user') {
        setLoadingTickets(true);
        try {
          const allTickets = await getTickets();
          const recipientTickets = allTickets.filter((t: any) => 
            t.email === email || t.userEmail === email
          );
          setUserTickets(recipientTickets);
        } catch (error) {
          console.error('Error fetching user tickets:', error);
          setUserTickets([]);
        } finally {
          setLoadingTickets(false);
        }
      } else {
        setUserTickets([]);
      }
    } else {
      setRecipientName('');
      setUserTickets([]);
      // Clear the name variable
      setVariables(prev => {
        const { name, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleTicketChange = (ticketId: string) => {
    setSelectedTicket(ticketId);
    
    // Find the selected ticket and auto-fill ticket details
    const ticket = userTickets.find(t => t.ticketId === ticketId);
    if (ticket) {
      setVariables(prev => ({
        ...prev,
        ticketId: ticket.ticketId || '',
        issueType: ticket.issueType || '',
        description: ticket.description || '',
        notes: ticket.notes || ''
      }));
    }
  };

  return (
    <AdminLayout title="Email Notifications">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-sm text-gray-600 mt-1">Manage and send email notifications to users and administrators</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Available Templates</h2>
              <p className="text-xs text-gray-500 mt-0.5">{templates.length} templates ready to use</p>
            </div>
            <Button onClick={() => setIsSendModalOpen(true)} leftIcon={<Send className="h-4 w-4" />}>
              Compose Email
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading templates...</p>
                </div>
              </div>
            ) : templates.length === 0 ? (
              <Card className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No templates available</p>
                <p className="text-sm text-gray-500 mt-1">Templates will appear here once created</p>
              </Card>
            ) : (
              templates.map(template => (
                <Card key={template.id} className="hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {template.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {template.subject}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {template.category}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">Email template</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        handleTemplateChange(template.id);
                        setIsSendModalOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all"
                    >
                      Use Template
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-xs text-gray-500 mt-0.5">Latest email notifications sent</p>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-gray-400 border-r-transparent"></div>
                    <p className="mt-2 text-xs text-gray-500">Loading...</p>
                  </div>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <History className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">No emails sent yet</p>
                  <p className="text-xs text-gray-500 mt-1">Your email history will appear here</p>
                </div>
              ) : (
                logs.slice(0, 5).map((log, index) => (
                  <div 
                    key={log.id}
                    onClick={() => {
                      setSelectedLogDetail(log);
                      setIsDetailModalOpen(true);
                    }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200 cursor-pointer group"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                        <History className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {log.templateName}
                      </p>
                      <p className="text-xs text-gray-600 truncate mt-0.5">
                        <span className="font-medium">To:</span> {log.recipient}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(log.sentDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        Sent
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {logs.length > 5 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-center">
                  View all activity →
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal isOpen={isSendModalOpen} onClose={handleCloseModal} title="Compose Email" maxWidth="3xl">
        <form onSubmit={handleSend} className="space-y-8">
          {/* Recipient Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Recipient Information</h3>
                <p className="text-sm text-gray-500">Select who will receive this email</p>
              </div>
            </div>
            
            <div className="pl-12 space-y-4">
              <Combobox
                label="Recipient Email"
                options={recipients
                  .filter(r => {
                    // For Welcome Email, Account Activation and Password Reset templates, show both users and admins
                    if (currentTemplate?.name === 'Welcome Email' ||
                        currentTemplate?.name === 'Account Activation' || 
                        currentTemplate?.name === 'Password Reset') {
                      return true;
                    }
                    // For other templates, only show users
                    return r.type === 'user';
                  })
                  .map(r => ({
                    value: r.email,
                    label: r.email,
                    sublabel: `${r.name} (${r.type === 'admin' ? 'Admin' : 'User'})`
                  }))}
                value={recipient}
                onChange={handleRecipientChange}
                placeholder="Search and select recipient..."
                required
                error={recipientError}
              />
              
              {recipientName && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
                    <div>
                      <span className="text-sm font-semibold text-green-900">{recipientName}</span>
                      <p className="text-xs text-green-700 mt-0.5">Recipient verified and ready</p>
                    </div>
                  </div>
                </div>
              )}

              {loadingTickets && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
                  <span>Loading user tickets...</span>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Template Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Email Template</h3>
                <p className="text-sm text-gray-500">Choose a pre-designed message template</p>
              </div>
            </div>
            
            <div className="pl-12">
              <Select 
                label="Template" 
                options={[
                  { value: '', label: '-- Select a template --' },
                  ...templates.map(t => ({
                    value: t.id,
                    label: t.name
                  }))
                ]} 
                value={selectedTemplate} 
                onChange={e => handleTemplateChange(e.target.value)} 
                required 
              />
              
              {currentTemplate && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-700"><span className="font-semibold">Subject:</span> {currentTemplate.subject}</p>
                  <p className="text-sm text-gray-700 mt-2"><span className="font-semibold">Category:</span> {currentTemplate.category}</p>
                </div>
              )}
            </div>
          </div>

          {/* Variables Section */}
          {templateVars.length > 0 && (
            <>
              <div className="border-t border-gray-200"></div>
              
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Customize Content</h3>
                    <p className="text-sm text-gray-500">Fill in the dynamic fields for this template</p>
                  </div>
                </div>
                
                <div className="pl-12 space-y-4">
                  {/* Name Field - Always shown first if template has name variable */}
                  {templateVars.includes('name') && (
                    <Input 
                      label="Name" 
                      value={variables['name'] || ''} 
                      onChange={e => setVariables(prev => ({
                        ...prev,
                        name: e.target.value
                      }))} 
                      placeholder="Enter name"
                      disabled={!!recipientName}
                    />
                  )}

                  {/* Ticket Selection for Ticket Resolved Template */}
                  {currentTemplate?.name === 'Ticket Resolved' && userTickets.length > 0 && (
                    <div className="space-y-2">
                      <Combobox
                        label="Select Ticket"
                        options={userTickets.map(ticket => ({
                          value: ticket.ticketId,
                          label: `#${ticket.ticketId}`,
                          sublabel: `${ticket.issueType} - ${ticket.description.substring(0, 50)}${ticket.description.length > 50 ? '...' : ''}`
                        }))}
                        value={selectedTicket}
                        onChange={handleTicketChange}
                        placeholder="Select the ticket that was resolved..."
                        required={currentTemplate?.name === 'Ticket Resolved'}
                      />
                      {!selectedTicket && (
                        <p className="text-xs text-amber-600 pl-1">⚠️ Please select a ticket to auto-fill ticket details</p>
                      )}
                    </div>
                  )}

                  {currentTemplate?.name === 'Ticket Resolved' && recipient && userTickets.length === 0 && !loadingTickets && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-900 font-medium">⚠️ This user has no tickets in the system.</p>
                      <p className="text-xs text-red-700 mt-1">Cannot send "Ticket Resolved" email to a user without tickets.</p>
                    </div>
                  )}

                  {/* Other Template Variables - Exclude name and ticketId */}
                  {templateVars
                    .filter(varName => varName.toLowerCase() !== 'ticketid' && varName.toLowerCase() !== 'name')
                    .map(varName => (
                    <Input 
                      key={varName} 
                      label={varName.charAt(0).toUpperCase() + varName.slice(1).replace(/([A-Z])/g, ' $1')} 
                      value={variables[varName] || ''} 
                      onChange={e => setVariables(prev => ({
                        ...prev,
                        [varName]: e.target.value
                      }))} 
                      placeholder={`Enter ${varName.toLowerCase()}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Preview Section */}
          {selectedTemplate && currentTemplate && (
            <>
              <div className="border-t border-gray-200"></div>
              
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Email Preview</h3>
                    <p className="text-sm text-gray-500">How your email will appear to the recipient</p>
                  </div>
                </div>
                
                <div className="pl-12">
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                    <div className="bg-white border-b border-slate-200 px-5 py-4">
                      <p className="text-xs font-medium text-slate-500 mb-2">Subject</p>
                      <p className="text-base font-semibold text-slate-900">{currentTemplate.subject}</p>
                    </div>
                    <div className="p-5">
                      <div className="bg-white rounded border border-slate-200 p-5 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm">
                        {currentTemplate.content.split('\n').map((line, i) => (
                          <div key={i} className={line.trim() === '' ? 'h-4' : ''}>{line}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6 flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isSending} 
              leftIcon={<Send className="h-4 w-4" />}
              disabled={
                !recipient || 
                !selectedTemplate || 
                (currentTemplate?.name === 'Ticket Resolved' && recipient && userTickets.length === 0 && !loadingTickets)
              }
            >
              Send Email
            </Button>
          </div>
        </form>
      </Modal>

      {/* Email Log Detail Modal */}
      <Modal 
        isOpen={isDetailModalOpen} 
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedLogDetail(null);
        }} 
        title="Email Details" 
        maxWidth="2xl"
      >
        {selectedLogDetail && (
          <div className="space-y-5">
            {/* Status Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                selectedLogDetail.status === 'sent' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <CheckCircle className={`h-4 w-4 ${selectedLogDetail.status === 'sent' ? 'text-green-600' : 'text-red-600'}`} />
                {selectedLogDetail.status === 'sent' ? 'Sent Successfully' : 'Failed'}
              </span>
            </div>

            {/* Template Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Template</span>
              </div>
              <p className="ml-6 text-sm font-semibold text-gray-900">{selectedLogDetail.templateName}</p>
              {selectedLogDetail.subject && (
                <p className="ml-6 text-xs text-gray-600 mt-1">Subject: {selectedLogDetail.subject}</p>
              )}
            </div>

            {/* Recipient */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Recipient</span>
              </div>
              <p className="ml-6 text-sm font-semibold text-gray-900">{selectedLogDetail.recipient}</p>
            </div>

            {/* Email Content Details */}
            {selectedLogDetail.variables && Object.keys(selectedLogDetail.variables).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Email Content Details</h4>
                <div className="space-y-3">
                  {Object.entries(selectedLogDetail.variables).map(([key, value]) => {
                    // Format the key for display
                    const displayKey = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, str => str.toUpperCase())
                      .trim();

                    return (
                      <div key={key} className="text-sm">
                        <span className="text-gray-600">{displayKey}:</span>
                        <p className="text-gray-900 font-medium mt-0.5 break-words">{value || '—'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sent By */}
            <div>
              <span className="text-sm font-medium text-gray-700">Sent By</span>
              <p className="mt-1 text-sm font-semibold text-gray-900">{selectedLogDetail.sentByName || selectedLogDetail.sentBy}</p>
            </div>

            {/* Date & Time */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Sent Date</span>
              </div>
              <p className="ml-6 text-sm font-semibold text-gray-900">
                {new Date(selectedLogDetail.sentDate).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>

            {/* Error Message */}
            {selectedLogDetail.status === 'failed' && selectedLogDetail.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs font-medium text-red-700 mb-1">Error:</p>
                <p className="text-xs text-red-600">{selectedLogDetail.error}</p>
              </div>
            )}

            {/* Action Button */}
            <div className="border-t pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedLogDetail(null);
                }}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}