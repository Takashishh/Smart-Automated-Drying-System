export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changeAdminPassword(data: ChangePasswordPayload): Promise<void> {
  try {
    const idToken = localStorage.getItem('idToken');
    if (!idToken) {
      throw new Error('No authentication token found');
    }

    const res = await fetch('http://localhost:3000/admin/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(data),
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error('Failed to change password');
    }
  } catch (err: unknown) {
    console.error('Error changing password:', err);
    throw err;
  }
}
