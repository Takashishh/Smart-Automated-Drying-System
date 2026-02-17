import { getAuthHeaders } from "../shared/get-auth-headers";

export async function deleteDevice(
    deviceId: string,
    reason: string
) {
  try {
    const res = await fetch("http://localhost:3000/devices/delete-device", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id: deviceId, reason }) 
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('Failed to delete device');
    }

    return true;

  } catch (err: unknown) {
    console.error("Error occurred in registering device:", err);
    throw err;
  }
}
