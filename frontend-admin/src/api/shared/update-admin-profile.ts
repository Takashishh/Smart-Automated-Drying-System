import { Admin } from '../../src/lib/types';

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phoneNumber?: string;
  address?: string;
}

export async function updateAdminProfile(data: UpdateProfilePayload): Promise<Admin> {
  try {
    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
      throw new Error('No authentication token found');
    }

    const res = await fetch('http://localhost:3000/admin/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(data),
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error('Failed to update profile');
    }

    return response.data;
  } catch (err: unknown) {
    console.error('Error updating profile:', err);
    throw err;
  }
}
