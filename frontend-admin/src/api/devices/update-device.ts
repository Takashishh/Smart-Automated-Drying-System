import { getAuthHeaders } from "../shared/get-auth-headers";

export async function updateDevice(
  deviceId: string,
  macId: string, // new mac id
  reason: string
) {
  try {
    const res = await fetch("http://localhost:3000/devices/update-device", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id: deviceId,
        macId,
        reason
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('Failed to update device');
    }

    return macId; //optimistic ui udate
  } catch (err: unknown) {
    console.error("Error occurred while updating device:", err);
    throw err;
  }
}
