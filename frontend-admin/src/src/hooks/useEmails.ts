import { useState, useEffect } from 'react';
import { EmailTemplate, EmailLog, User, Admin } from '../lib/types';
import { getEmailTemplates } from '../../api/email-templates/get-email-templates';
import { sendEmail as sendEmailApi } from '../../api/email-templates/send-email';
import { getEmailLogs as getEmailLogsApi } from '../../api/email-templates/get-email-logs';
import { getUsers } from '../../api/users/get-users';
import { getAdminsFromAPI } from '../../api/shared/get-admins';
import { useAuth } from './useAuth';

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

  const fetchTemplates = async () => {
    try {
      const data = await getEmailTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await getEmailLogsApi();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const fetchRecipients = async () => {
    try {
      const [usersData, adminsData] = await Promise.all([
        getUsers().catch(() => []),
        getAdminsFromAPI().catch(() => []),
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
      await Promise.all([fetchTemplates(), fetchLogs(), fetchRecipients()]);
      setLoading(false);
    };
    fetchData();
  }, []);

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
    await fetchLogs();
  };

  return {
    templates,
    logs,
    recipients,
    loading,
    sendEmail,
  };
}