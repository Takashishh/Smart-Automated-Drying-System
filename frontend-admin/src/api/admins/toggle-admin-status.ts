import { getAuthHeaders } from "../shared/get-auth-headers";

export async function toggleAdminStatusApi(adminUid: string, newStatus: 'active' | 'disabled'){
  try{
    const res = await fetch('http://localhost:3000/admin/toggle-status',{
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ adminUid, status: newStatus })
    });

    if(!res.ok){
      const err = await res.json().catch(()=>null);
      throw new Error(err?.message || `Failed to update admin status: ${res.status}`);
    }

    return (await res.json()).data ?? null;
  }catch(err){
    console.error('Error toggling admin status:', err);
    throw err;
  }
}
