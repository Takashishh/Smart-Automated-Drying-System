export async function getDevices() {
  try {
    console.log('🔵 Fetching devices from API...');
    
    const res = await fetch("http://localhost:3000/devices/get-devices", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log('🔵 Response status:', res.status, res.statusText);

    if (!res.ok) {
      throw new Error('Failed to load devices');
    }

    const json = await res.json();
    console.log('🔵 Full API response:', json);
    console.log('🔵 Devices data:', json.data);
    console.log('🔵 Number of devices:', json.data?.length || 0);
    
    // Log each device's connectedUser array
    if (json.data && Array.isArray(json.data)) {
      json.data.forEach((device: any, index: number) => {
        console.log(`🔵 Device ${index + 1}:`, {
          uuid: device.uuid,
          macId: device.macId,
          connectedUser: device.connectedUser,
          connectedUserType: typeof device.connectedUser,
          connectedUserIsArray: Array.isArray(device.connectedUser),
          connectedUserLength: device.connectedUser?.length || 0
        });
      });
    }

    return json.data;
  } catch (err: unknown) {
    console.error("❌ Error fetching devices:", err);
    throw err;
  }
}