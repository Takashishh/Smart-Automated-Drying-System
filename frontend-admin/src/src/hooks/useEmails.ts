import { useState, useEffect } from 'react';
import { EmailTemplate, EmailLog, User, Admin } from '../lib/types';
import { getEmailTemplates } from '../../api/email-templates/get-email-templates';
import { sendEmail as sendEmailApi } from '../../api/email-templates/send-email';
import { getEmailLogs as getEmailLogsApi } from '../../api/email-templates/get-email-logs';
import { getUsers } from '../../api/users/get-users';
import { getAdminsFromAPI } from '../../api/shared/get-admins';
import { useAuth } from './useAuth';

const PAGE_SIZE = 10;

export interface EmailRecipient {
  email: string;
  name: string;
  type: 'user' | 'admin';
}

export function useEmails() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsTotalItems, setLogsTotalItems] = useState(0);

  const fetchTemplates = async () => {
    try {
      const data = await getEmailTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchLogs = async (page: number) => {
    try {
      const result = await getEmailLogsApi(page, PAGE_SIZE);
      setLogs(result.data);
      setLogsPage(result.pagination.currentPage || page);
      setLogsTotalPages(result.pagination.totalPages || 1);
      setLogsTotalItems(result.pagination.totalItems || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const fetchAllUsers = async () => {
    const users: any[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const result = await getUsers(page, 100);
      users.push(...result.data);
      totalPages = result.pagination.totalPages || 1;
      page += 1;
    } while (page <= totalPages);

    return users;
  };

  const fetchAllAdmins = async () => {
    const admins: any[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const result = await getAdminsFromAPI(page, 100);
      admins.push(...result.data);
      totalPages = result.pagination.totalPages || 1;
      page += 1;
    } while (page <= totalPages);

    return admins;
  };

  const fetchRecipients = async () => {
    try {
      const [usersData, adminsData] = await Promise.all([
        fetchAllUsers().catch(() => []),
        fetchAllAdmins().catch(() => []),
      ]);

      const userRecipients: EmailRecipient[] = (usersData || []).map((u: User) => ({
        email: u.email,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || u.email,
        type: 'user' as const,
      }));

      const adminRecipients: EmailRecipient[] = (adminsData || []).map((a: Admin) => ({
        email: a.email,
        name: `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email,
        type: 'admin' as const,
      }));

      setRecipients([...userRecipients, ...adminRecipients]);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchTemplates(), fetchLogs(logsPage), fetchRecipients()]);
      setLoading(false);
    };
    fetchData();

    // Poll for new logs every 30 seconds
    const pollInterval = setInterval(() => {
      fetchLogs(logsPage);
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, [logsPage]);

  const sendEmail = async (recipient: string, templateId: string, variables?: Record<string, string>) => {
    if (!user?.adminId) {
      throw new Error('User not authenticated');
    }

    await sendEmailApi({
      recipient,
      templateId,
      variables,
      adminId: user.adminId,
    });

    // Refresh logs after sending
    await fetchLogs(logsPage);
  };

  return {
    templates,
    logs,
    recipients,
    loading,
    logsPage,
    logsTotalPages,
    logsTotalItems,
    setLogsPage,
    sendEmail,
  };
}