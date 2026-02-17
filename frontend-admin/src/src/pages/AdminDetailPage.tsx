import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAdmins } from '../hooks/useAdmins';
import { ArrowLeft, Shield, Ban, CheckCircle, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { getAuditLogs } from '../../api/audit-logs/get-audit-logs';
export function AdminDetailPage() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    admins,
    toggleAdminStatus
  } = useAdmins();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  
  const admin = admins.find(a => a.adminId === id);
  
  // Fetch audit logs for this admin
  useEffect(() => {
    const fetchAdminLogs = async () => {
      if (!admin?.email) return;
      
      try {
        setLoadingLogs(true);
        const logs = await getAuditLogs();
        // Filter logs by this admin's email (performedBy contains email in format "Name (email)")
        const adminLogs = logs
          .filter((log: any) => log.performedBy && log.performedBy.includes(admin.email))
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10);
        setAuditLogs(adminLogs);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
      } finally {
        setLoadingLogs(false);
      }
    };
    
    fetchAdminLogs();
  }, [admin?.email]);
  
  if (!admin) {
    return <AdminLayout title="Admin Not Found">
        <div className="text-center py-12">
          <Button onClick={() => navigate('/admins')}>Back to Admins</Button>
        </div>
      </AdminLayout>;
  }
  const displayName = (admin.firstName || admin.lastName)
    ? `${admin.firstName ?? ''} ${admin.middleName ? `${admin.middleName} ` : ''}${admin.lastName ?? ''}`.replace(/\s+/g, ' ').trim()
    : admin.email;
  const initial = displayName.charAt(0).toUpperCase();
  const handleToggleStatus = async () => {
    setIsProcessing(true);
    try {
      await toggleAdminStatus(admin.adminId);
      toast.success(`Admin account has been ${admin.status === 'active' ? 'disabled' : 'activated'}`);
      setIsConfirmOpen(false);
    } catch (error) {
      toast.error('Couldn\'t update the admin account. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const getActionBadgeColor = (action: string) => {
    if (!action) return 'neutral';
    if (action.includes('Created') || action.includes('Enabled')) return 'success';
    if (action.includes('Disabled') || action.includes('Deleted')) return 'danger';
    if (action.includes('Updated') || action.includes('Assigned')) return 'warning';
    return 'neutral';
  };
  
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  return <AdminLayout title="Admin Details">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/admins')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to Admins
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100 mb-6">
              <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-3xl font-bold mb-4">
                {initial}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {displayName}
              </h2>
              <p className="text-sm text-gray-500 mb-2">{admin.email}</p>
              <div className="flex gap-2 justify-center mt-2">
                <Badge variant={admin.role === 'super-admin' ? 'primary' : 'neutral'}>
                  {admin.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                </Badge>
                <Badge variant={admin.status === 'active' ? 'success' : 'danger'}>
                  {admin.status === 'active' ? 'Active' : 'Disabled'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Joined</span>
                <span className="text-gray-900">
                  {new Date(admin.createdDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last Login</span>
                <span className="text-gray-900">
                  {new Date(admin.lastLogin).toLocaleDateString()}
                </span>
              </div>
              {admin.phoneNumber && <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-900">{admin.phoneNumber}</span>
                </div>}
            </div>

            <div className="mt-8">
              <Button variant={admin.status === 'active' ? 'danger' : 'success' as any} className="w-full justify-start" onClick={() => setIsConfirmOpen(true)} leftIcon={admin.status === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />} disabled={admin.role === 'super-admin'} // Prevent disabling super admins for safety in MVP
            >
                {admin.status === 'active' ? 'Disable Account' : 'Enable Account'}
              </Button>
              {admin.role === 'super-admin' && <p className="text-xs text-gray-400 mt-2 text-center">
                  Super Admin accounts cannot be disabled.
                </p>}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title="Recent Activity">
            {loadingLogs ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto text-gray-300 mb-3 animate-pulse" />
                <p>Loading activity logs...</p>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No recent activity logs found for this admin.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {auditLogs.map((log: any, index: number) => (
                  <div 
                    key={log.id || index} 
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Badge variant={getActionBadgeColor(log.action) as any}>
                        {log.action || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">
                        {log.action || 'Unknown action'}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        Target: {log.target || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleToggleStatus} title={admin.status === 'active' ? 'Disable Admin Account' : 'Enable Admin Account'} message={`Are you sure you want to ${admin.status === 'active' ? 'disable' : 'enable'} access for ${displayName}? This will ${admin.status === 'active' ? 'prevent' : 'allow'} them to log in to the system.`} confirmText={admin.status === 'active' ? 'Disable Account' : 'Enable Account'} variant={admin.status === 'active' ? 'danger' : 'primary'} isLoading={isProcessing} />
    </AdminLayout>;
}