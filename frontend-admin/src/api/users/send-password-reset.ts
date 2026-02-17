import { getAuthHeaders } from "../shared/get-auth-headers";

export async function sendPasswordReset(
  userId: string,
  reason: string
) {
  try {
    const res = await fetch("http://localhost:3000/users/send-password-reset", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, reason })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('Failed to send password reset');
    }

    const json = await res.json();
    return json.data ?? null;
  } catch (err: unknown) {
    console.error("Error occurred while sending password reset:", err);
    throw err;
  }
}
