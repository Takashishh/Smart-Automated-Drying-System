import { getAuthHeaders } from "../shared/get-auth-headers";

export async function disableAccount(
  userId: string,
  reason: string
) {
  try {
    const res = await fetch("http://localhost:3000/users/disable-account", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, reason })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('Failed to disable account');
    }

    const json = await res.json();
    return json.data ?? null; 
  } catch (err: unknown) {
    console.error("Error occurred while disabling account:", err);
    throw err;
  }
}
