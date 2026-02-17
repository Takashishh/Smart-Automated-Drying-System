import { useState, useEffect } from 'react';
import { createAdminAccount, type CreateAdminPayload } from '../../api/shared/create-admin';
import { getAdminsFromAPI } from '../../api/shared/get-admins';
import { Admin } from '../lib/types';

export function useAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminsFromAPI();
        
        // Map the API response to the Admin interface
        const mappedAdmins: Admin[] = data.map(admin => ({
          adminId: admin.adminId,
          uid: admin.uid, // Include Firebase UID
          email: admin.email,
          firstName: admin.firstName ?? undefined,
          lastName: admin.lastName ?? undefined,
          middleName: admin.middleName ?? undefined,
          role: admin.role as 'admin' | 'super-admin',
          status: admin.status as 'active' | 'disabled',
          authMethod: 'email' as const, // Default to email if not provided
          createdDate: admin.createdDate ?? new Date().toISOString(),
          lastLogin: admin.lastLogin ?? new Date().toISOString()
        }));
        
        setAdmins(mappedAdmins);
      } catch (err) {
        console.error('Error fetching admins:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch admins');
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdmins();
  }, []);
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
    createAdmin,
    toggleAdminStatus
  };
}