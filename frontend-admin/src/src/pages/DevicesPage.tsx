import { useState, useEffect } from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { CreateDeviceModal } from '../components/devices/CreateDeviceModal';
import { AssignDeviceModal } from '../components/devices/AssignDeviceModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Link as LinkIcon, Unlink, Users, Edit3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Device } from '../lib/types';
import { getDevices } from '../../api/devices/get-devices';
import { getUsers } from '../../api/users/get-users';
import { assignDevice } from '../../api/devices/assign-device';
import { unassignDevice } from '../../api/devices/unassign-device';
import { deleteDevice } from '../../api/devices/delete-device';
import { updateDevice } from '../../api/devices/update-device';
import { registerDevice } from '../../api/devices/register-device';

export function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unassignAction, setUnassignAction] = useState<{
    deviceId: string;
    userId: string;
    userName: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editTarget, setEditTarget] = useState<Device | null>(null);
  const [editMac, setEditMac] = useState('');
  const [editReason, setEditReason] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Device | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchDevices();

    // Poll for new devices every 30 seconds
    const pollInterval = setInterval(() => {
      fetchDevices();
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, [currentPage]);

  const fetchAllUsers = async () => {
    const users: any[] = [];
    let page = 1;
    let pages = 1;

    do {
      const result = await getUsers(page, 100);
      users.push(...result.data);
      pages = result.pagination.totalPages || 1;
      page += 1;
    } while (page <= pages);

    return users;
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const [devicesResult, usersData] = await Promise.all([
        getDevices(currentPage, PAGE_SIZE),
        fetchAllUsers()
      ]);

      const devicesData = devicesResult.data;
      setCurrentPage(devicesResult.pagination.currentPage || currentPage);
      setTotalPages(devicesResult.pagination.totalPages || 1);
      setTotalItems(devicesResult.pagination.totalItems || 0);

      const userMap = new Map(
        usersData.map((user: any) => {
          const displayName = user.displayName || 
                            `${user.firstName || ''} ${user.lastName || ''}`.trim() || 
                            user.email || 
                            'Unknown User';
          return [user.uuid, displayName];
        })
      );
      
      const transformedDevices = devicesData.map((device: any) => {
        const userIds = Array.isArray(device.connectedUser) ? device.connectedUser : [];
        const userNames = userIds.map((userId: string) => 
          userMap.get(userId) || 'Unknown User'
        );

        return {
          deviceId: device.uuid,
          macId: device.macId,
          userIds: userIds,
          userNames: userNames,
          createdDate: device.createdAt,
          updatedDate: device.updatedAt
        };
      });
      
      setDevices(transformedDevices);
    } catch (error) {
      toast.error('Couldn\'t load your devices. Please refresh the page.');
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter((device: Device) => 
    device.macId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    device.userNames && device.userNames.some((name: string) => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleCreate = async (macId: string) => {
    try {
      await registerDevice(macId);
      toast.success('Device added to your system!');
      setIsCreateModalOpen(false);
      await fetchDevices();
    } catch (error) {
      toast.error('Couldn\'t add the device. Please check the device ID and try again.');
      throw error;
    }
  };

  const handleAssign = async (userId: string, userName: string) => {
    if (!selectedDevice) return;
    
    try {
      await assignDevice(userId, selectedDevice, undefined);
      toast.success(`Device assigned to ${userName}`);
      setIsAssignModalOpen(false);
      setSelectedDevice(null);
      await fetchDevices();
    } catch (error) {
      toast.error('Couldn\'t assign the device. Please try again.');
      console.error('Error assigning device:', error);
      throw error;
    }
  };

  const handleUnassign = async () => {
    if (!unassignAction) return;
    setIsProcessing(true);
    try {
      await unassignDevice(
        unassignAction.userId, 
        unassignAction.deviceId, 
        `Unassigned from ${unassignAction.userName}`
      );
      
      toast.success(`Device removed from ${unassignAction.userName}`);
      setUnassignAction(null);
      await fetchDevices();
    } catch (error) {
      toast.error('Couldn\'t remove the device. Please try again.');
      console.error('Error unassigning device:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const openAssignModal = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setIsAssignModalOpen(true);
  };

  const openEditModal = (device: Device) => {
    setEditTarget(device);
    setEditMac(device.macId);
    setEditReason('');
  };

  const handleUpdateMac = async () => {
    if (!editTarget || !editMac || !editReason.trim()) return;
    setIsSavingEdit(true);
    try {
      await updateDevice(editTarget.deviceId, editMac, editReason.trim());
      
      toast.success('Device information updated!');
      setEditTarget(null);
      setEditMac('');
      setEditReason('');
      setIsEditConfirmOpen(false);
      await fetchDevices();
    } catch (error) {
      toast.error('Couldn\'t update the device. Please try again.');
      console.error('Error updating device:', error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !deleteReason.trim()) return;
    setIsDeleting(true);
    try {
      await deleteDevice(deleteTarget.deviceId, deleteReason.trim());
      
      toast.success('Device removed from your system');
      setDeleteTarget(null);
      setDeleteReason('');
      await fetchDevices();
    } catch (error) {
      toast.error('Couldn\'t delete the device. Please try again.');
      console.error('Error deleting device:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout title="Device Management">
      <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Many-to-Many Device Assignment</p>
            <p className="text-blue-700">
              Devices can be assigned to multiple users, and users can have
              multiple devices. Each assignment is independent.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="w-1/3">
          <SearchInput 
            placeholder="Search by MAC ID or User..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)} 
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Register Device
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MAC Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    Loading devices...
                  </td>
                </tr>
              ) : filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    No devices found
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device: Device) => (
                  <tr key={device.deviceId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                      {device.macId}
                    </td>
                    <td className="px-6 py-4">
                      {device.userIds.length === 0 ? (
                        <span className="text-gray-400 italic text-sm">
                          No users assigned
                        </span>
                      ) : (
                        <div className="space-y-1">
                          {device.userNames?.map((userName: string, idx: number) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm"
                            >
                              <span className="text-gray-700">{userName}</span>
                              <button
                                onClick={() =>
                                  setUnassignAction({
                                    deviceId: device.deviceId,
                                    userId: device.userIds[idx],
                                    userName
                                  })
                                }
                                className="text-red-600 hover:text-red-800 ml-2"
                                title="Unassign from this user"
                              >
                                <Unlink className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(device.createdDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium sticky right-0 bg-white">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => openAssignModal(device.deviceId)}
                          title="Assign to User"
                        >
                          <LinkIcon className="h-4 w-4 mr-1" /> Assign
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:text-amber-800"
                          onClick={() => openEditModal(device)}
                          title="Edit MAC"
                        >
                          <Edit3 className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => {
                            setDeleteTarget(device);
                            setDeleteReason('');
                          }}
                          title="Delete device"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Page {currentPage} of {Math.max(totalPages, 1)} · {totalItems} total devices
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1 || loading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1))}
            disabled={loading || currentPage >= (totalPages || 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <CreateDeviceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />

      <AssignDeviceModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedDevice(null);
        }}
        onAssign={handleAssign}
        currentUserIds={
          selectedDevice
            ? devices.find((d: Device) => d.deviceId === selectedDevice)?.userIds || []
            : []
        }
      />

      <ConfirmDialog
        isOpen={!!unassignAction}
        onClose={() => setUnassignAction(null)}
        onConfirm={handleUnassign}
        title="Unassign Device"
        message={`Are you sure you want to unassign this device from ${unassignAction?.userName}? Other users will still have access to this device.`}
        confirmText="Unassign"
        variant="warning"
        isLoading={isProcessing}
      />

      <Modal
        isOpen={!!editTarget}
        onClose={() => {
          setEditTarget(null);
          setEditMac('');
          setEditReason('');
        }}
        title="Edit MAC Address"
      >
        <div className="space-y-4">
          <Input
            label="MAC Address"
            value={editMac}
            onChange={e => setEditMac(e.target.value)}
            placeholder="AA:BB:CC:11:22:33"
            required
            pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
            error={
              editMac && !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(editMac)
                ? 'Invalid MAC format'
                : undefined
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for update
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editReason}
              onChange={e => setEditReason(e.target.value)}
              placeholder="Describe why this MAC is being updated"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => {
                setEditTarget(null);
                setEditMac('');
                setEditReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => setIsEditConfirmOpen(true)}
              disabled={
                !editMac ||
                !/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(editMac) ||
                !editReason.trim() ||
                editMac === editTarget?.macId
              }
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isEditConfirmOpen && !!editTarget}
        onClose={() => setIsEditConfirmOpen(false)}
        onConfirm={handleUpdateMac}
        title="Confirm Update"
        message={`Update MAC from ${editTarget?.macId} to ${editMac}?\nReason: ${editReason}`}
        confirmText="Confirm Update"
        variant="warning"
        isLoading={isSavingEdit}
      />

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteReason('');
        }}
        title="Delete Device"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Delete device {deleteTarget?.macId}? This cannot be undone.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for deletion
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              value={deleteReason}
              onChange={e => setDeleteReason(e.target.value)}
              placeholder="Describe why this device is being removed"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={() => {
                setDeleteTarget(null);
                setDeleteReason('');
              }} 
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              disabled={!deleteReason.trim()}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}