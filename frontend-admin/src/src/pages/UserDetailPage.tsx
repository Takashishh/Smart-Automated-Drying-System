import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UserStatusBadge } from '../components/users/UserStatusBadge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ArrowLeft, Mail, Shield, Smartphone, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { getUserInfo } from '../../api/users/get-user-info';
import { disableAccount } from '../../api/users/disable-account';
import { activateAccount } from '../../api/users/activate-account';
import { sendPasswordReset } from '../../api/users/send-password-reset';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [confirmAction, setConfirmAction] = useState<{
    type: 'toggleStatus' | 'resetPassword' | 'unassignDevice';
    payload?: any;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reason, setReason] = useState('');

  // Fetch specific user on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const userData = await getUserInfo(id);
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user info:', err);
        toast.error('Couldn\'t load user information. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout title="User Details">
        <div className="text-center py-12 text-gray-500">Loading user info...</div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout title="User Not Found">
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">User not found or does not exist.</p>
          <Button onClick={() => navigate('/users')}>Back to Users</Button>
        </div>
      </AdminLayout>
    );
  }

  // Get user devices from the user object itself
  const userDevices = Array.isArray(user.devices) ? user.devices : [];

  const handleConfirm = async () => {
    if (!confirmAction) return;
    
    // Validate reason input
    if (!reason.trim()) {
      toast.error('Please tell us why (this is required)');
      return;
    }

    setIsProcessing(true);
    try {
      if (confirmAction.type === 'toggleStatus') {
        if (user.status === 'activated') {
          await disableAccount(user.uuid, reason);
          toast.success('User account has been disabled');
        } else {
          await activateAccount(user.uuid, reason);
          toast.success('User account has been activated');
        }
      } else if (confirmAction.type === 'resetPassword') {
        await sendPasswordReset(user.uuid, reason);
        toast.success('Password reset email has been sent');
      } else if (confirmAction.type === 'unassignDevice') {
        // TODO: Call your unassign device API here
        // await unassignDeviceAPI(confirmAction.payload.deviceId, user.uuid);
        toast.success('Device removed from user');
      }

      // Refresh user info after actions
      const refreshedUser = await getUserInfo(user.uuid);
      setUser(refreshedUser);

      setConfirmAction(null);
      setReason('');
    } catch (err) {
      console.error('Action failed:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelDialog = () => {
    setConfirmAction(null);
    setReason('');
  };

  return (
    <AdminLayout title="User Details">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/users')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Users
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100 mb-6">
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                {(user.displayName ?? `${user.firstName} ${user.lastName}`)[0]}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.displayName ?? `${user.firstName} ${user.lastName}`}</h2>
              <p className="text-sm text-gray-500 mb-2">{user.email}</p>
              <UserStatusBadge status={user.status} />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">User ID</span>
                <span className="font-mono text-gray-900 text-xs break-all">{user.uuid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Joined</span>
                <span className="text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Devices</span>
                <span className="text-gray-900 font-semibold">{userDevices.length}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setConfirmAction({ type: 'resetPassword' })}
                leftIcon={<Mail className="h-4 w-4" />}
              >
                Send Password Reset
              </Button>
              <Button
                variant={user.status === 'activated' ? 'danger' : 'primary'}
                className="w-full justify-start"
                onClick={() => setConfirmAction({ type: 'toggleStatus' })}
                leftIcon={user.status === 'activated' ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
              >
                {user.status === 'activated' ? 'Disable Account' : 'Activate Account'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Devices List */}
        <div className="lg:col-span-2">
          <Card title={`Assigned Devices (${userDevices.length})`}>
            {userDevices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Smartphone className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No devices assigned to this user.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/devices')}>
                  Assign Device
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MAC ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {userDevices.map((device: any) => (
                      <tr key={device.uuid || device.deviceId}>
                        <td className="px-4 py-3 font-mono text-sm">{device.macId}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${device.status === 'paired' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {device.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {device.createdAt ? new Date(device.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => setConfirmAction({ type: 'unassignDevice', payload: { deviceId: device.uuid || device.deviceId } })}
                          >
                            Unassign
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {confirmAction.type === 'toggleStatus'
                ? user.status === 'activated'
                  ? 'Disable Account'
                  : 'Activate Account'
                : confirmAction.type === 'resetPassword'
                ? 'Reset Password'
                : 'Unassign Device'}
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {confirmAction.type === 'toggleStatus'
                  ? `Are you sure you want to ${user.status === 'activated' ? 'disable' : 'activate'} this user account?`
                  : confirmAction.type === 'resetPassword'
                  ? 'Are you sure you want to send a password reset email to this user?'
                  : 'Are you sure you want to unassign this device from this user?'}
              </p>
              
              <div>
                <label htmlFor="reason-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason-input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for this action..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleCancelDialog}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant={confirmAction.type === 'toggleStatus' && user.status === 'activated' ? 'danger' : 'primary'}
                onClick={handleConfirm}
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}