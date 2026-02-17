const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export async function getUserInfo(userId: string) {
  try {
    const res = await fetch(`${API_URL}/users/get-user-info/${userId}`);
    
    if (!res.ok) {
      throw new Error(`Failed to load user info`);
    }
    
    const data = await res.json();
    return data.data ?? data;
  } catch (err) {
    throw err;
  }
}