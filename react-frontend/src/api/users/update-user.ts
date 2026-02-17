const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export async function updateUser(userId: string, payload: Record<string, unknown>) {
  const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const token = authUser?.idToken || authUser?.token || '';
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(`${API_URL}/users/update-user/${userId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Unable to update user');
  }

  const data = await res.json();
  return data.data ?? data;
}