import { useState, useEffect } from 'react';
import { createAdminAccount, type CreateAdminPayload } from '../../api/shared/create-admin';
import { getAdminsFromAPI } from '../../api/shared/get-admins';
import { Admin } from '../lib/types';

const PAGE_SIZE = 10;

export function useAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchAdmins = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAdminsFromAPI(page, PAGE_SIZE);
      const data = result.data;
      
      const mappedAdmins: Admin[] = data.map(admin => ({
        adminId: admin.adminId,
        uid: admin.uid,
        email: admin.email,
        firstName: admin.firstName ?? undefined,
        lastName: admin.lastName ?? undefined,
        middleName: admin.middleName ?? undefined,
        role: admin.role as 'admin' | 'super-admin',
        status: admin.status as 'active' | 'disabled',
        authMethod: 'email' as const,
        createdDate: admin.createdDate ?? new Date().toISOString(),
        lastLogin: admin.lastLogin ?? new Date().toISOString()
      }));
      
      setAdmins(mappedAdmins);
      setCurrentPage(result.pagination.currentPage || page);
      setTotalPages(result.pagination.totalPages || 1);
      setTotalItems(result.pagination.totalItems || 0);
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch admins');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins(currentPage);

    // Poll for new admins every 30 seconds
    const pollInterval = setInterval(() => {
      fetchAdmins(currentPage);
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  }, [currentPage]);
  const createAdmin = async (data: CreateAdminPayload) => {
    const apiResult = await createAdminAccount(data);

    const displayName = data.firstName || data.lastName
      ? `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim()
      : data.email.split("@")[0] || data.email;

    const newAdmin: Admin = {
      adminId: apiResult.adminId ?? `admin-${Date.now()}`,
      email: data.email,
      firstName: data.firstName ?? displayName,
      lastName: data.lastName ?? "",
      middleName: data.middleName,
      role: 'admin',
      status: 'active',
      authMethod: 'email',
      createdDate: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    setAdmins(prev => [...prev, newAdmin]);
    return newAdmin;
  };

  const toggleAdminStatus = async (adminId: string) => {
    const admin = admins.find(a => a.adminId === adminId);
    if (!admin) throw new Error('Admin not found');

    const newStatus = admin.status === 'active' ? 'disabled' : 'active';

    try {
      // Call backend to update status (will also update Firebase Auth)
      const { toggleAdminStatusApi } = await import('../../api/admins/toggle-admin-status');
      await toggleAdminStatusApi(admin.uid || admin.adminId, newStatus as 'active' | 'disabled');

      // update local state after successful backend update
      setAdmins(prev => prev.map(a => {
        if (a.adminId === adminId) {
          return { ...a, status: newStatus };
        }
        return a;
      }));
    } catch (err) {
      console.error('Failed to toggle admin status:', err);
      throw err;
    }
  };
  
  return {
    admins,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    setCurrentPage,
    createAdmin,
    toggleAdminStatus
  };
}