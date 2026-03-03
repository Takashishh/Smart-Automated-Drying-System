import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { SearchInput } from '../components/ui/SearchInput';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { UserStatusBadge } from '../components/users/UserStatusBadge';
import { Eye } from 'lucide-react';
import { getUsers } from '../../api/users/get-users';
import { getUserInfo } from '../../api/users/get-user-info';

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const PAGE_SIZE = 10;

  // Fetch users on mount and poll every 30 seconds
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const result = await getUsers(currentPage, PAGE_SIZE);
        setUsers(result.data);
        setCurrentPage(result.pagination.currentPage || currentPage);
        setTotalPages(result.pagination.totalPages || 1);
        setTotalItems(result.pagination.totalItems || 0);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();

    // Poll for new users every 30 seconds
    const pollInterval = setInterval(() => {
      fetchUsers();
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, [currentPage]);

  // Filtered & searchable list
  const filteredUsers = users.filter(user => {
    const name = user.displayName ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`;
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.status === 'activated') ||
      (statusFilter === 'disabled' && user.status === 'disabled');

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="User Management">
      <Card className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
          <div className="w-full sm:w-1/2 lg:w-1/3">
            <SearchInput
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[200px]">
            <Select
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Activated' },
                { value: 'disabled', label: 'Disabled' },
              ]}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="mb-0"
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Devices
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 sm:px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 sm:px-6 py-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const name = user.displayName ?? `${user.firstName ?? ''} ${user.lastName ?? ''}`;
                  return (
                    <tr key={user.uuid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center min-w-0">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                            {name.charAt(0)}
                          </div>
                          <div className="ml-3 sm:ml-4 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
                            <div className="text-sm text-gray-500 truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <UserStatusBadge status={user.status ?? 'activated'} />
                      </td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.devices?.length ?? 0} Devices
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/users/${user.uuid}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Page {currentPage} of {Math.max(totalPages, 1)} · {totalItems} total users
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
    </AdminLayout>
  );
}
