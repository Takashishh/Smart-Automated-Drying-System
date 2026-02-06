import { getAuthHeaders } from "../shared/get-auth-headers";

export async function activateAccount(
  userId: string,
  reason: string
) {
  try {

    console.log('received reason: ', reason);

    const res = await fetch("http://localhost:3000/users/activate-account", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, reason })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Failed to activate account: ${res.status} ${errorText}`
      );
    }

    const json = await res.json();
    return json.data ?? null; // return backend data if any
  } catch (err: unknown) {
    console.error("Error occurred while activating account:", err);
    throw err;
  }
}
