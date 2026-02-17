import { getAuthHeaders } from "../shared/get-auth-headers";

export async function unassignDevice(
    userId: string,
    deviceId: string,
    reason: string | undefined
) {
    try {
        const res = await fetch("http://localhost:3000/devices/unassign-device", {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                userId,
                deviceId,
                ...(reason && { reason })
            })
        });

        if (!res.ok) {
            throw new Error('Failed to remove device');
        }

        const json = await res.json();
        return json.data;
    } catch (err: unknown) {
        console.error(`Error occurred in assigning device:`, err);
        throw err;
    }
}