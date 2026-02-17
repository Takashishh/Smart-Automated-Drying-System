import { getAuthHeaders } from "../shared/get-auth-headers";

export async function registerDevice(macId: string) {
  try {
    const res = await fetch("http://localhost:3000/devices/create-device", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ macId }) 
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error('Failed to register device');
    }

    const json = await res.json();
    return json.data;
  } catch (err: unknown) {
    console.error("Error occurred in registering device:", err);
    throw err;
  }
}
