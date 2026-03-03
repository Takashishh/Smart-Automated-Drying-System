import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { getUsers } from '../../../api/users/get-users';
import { toast } from 'sonner';

interface User {
  uuid: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean;
  contactNumber: string | null;
  photoUrl: string | null;
  address: string | null;
  status: string;
  devices: any[];
  createdAt: string | null;
  updatedAt: string | null;
}

interface AssignDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string, userName: string) => Promise<void>;
  currentUserIds: string[];
}

export function AssignDeviceModal({
  isOpen,
  onClose,
  onAssign,
  currentUserIds
}: AssignDeviceModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedUserId('');
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users: User[] = [];
      let page = 1;
      let totalPages = 1;

      do {
        const result = await getUsers(page, 100);
        users.push(...result.data);
        totalPages = result.pagination.totalPages || 1;
        page += 1;
      } while (page <= totalPages);

      const data = users;
      setUsers(data);
    } catch (error) {
      toast.error('Couldn\'t load users. Please try again.');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (user: User) => {
    if (user.displayName) return user.displayName;
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email || 'Unknown User';
  };

  // Filter out users already assigned to this device
  // Show all users regardless of status for now (can add status filter later if needed)
  const availableUsers = users.filter(
    u => !currentUserIds.includes(u.uuid)
  );

  console.log('All users:', users);
  console.log('Current user IDs:', currentUserIds);
  console.log('Available users:', availableUsers);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    setIsSubmitting(true);
    try {
      const user = users.find(u => u.uuid === selectedUserId);
      if (user) {
        await onAssign(selectedUserId, getUserDisplayName(user));
        setSelectedUserId('');
        onClose();
      }
    } catch (error) {
      console.error(error);
      // Error toast is handled in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Device to User">
      <form onSubmit={handleSubmit} className="space-y-4">
        {loading ? (
          <div className="text-center py-4 text-gray-500">
            <p>Loading users...</p>
          </div>
        ) : availableUsers.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>
              No available users to assign. All active users are already
              assigned to this device.
            </p>
          </div>
        ) : (
          <>
            <Select
              label="Select User"
              options={[
                {
                  value: '',
                  label: 'Choose a user...'
                },
                ...availableUsers.map(u => ({
                  value: u.uuid,
                  label: `${getUserDisplayName(u)} (${u.email || 'No email'})`
                }))
              ]}
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              required
            />

            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
              <strong>Note:</strong> This device can be assigned to multiple
              users. Each user will have independent access.
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          {availableUsers.length > 0 && (
            <Button type="submit" isLoading={isSubmitting} disabled={!selectedUserId || loading}>
              Assign Device
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}