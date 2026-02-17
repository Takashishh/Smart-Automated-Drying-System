export async function getUserInfo(userId: string) {
  try {
    console.log(`current user id: ${userId}`)
    const res = await fetch(`http://localhost:3000/users/get-user-info/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to load user information');
    }

    const json = await res.json();
    console.log('Raw API response:', json.data);
    
    // Transform if needed - adjust based on your actual API response structure
    const transformedData = {
      uuid: json.data.uuid || json.data.id,
      displayName: json.data.displayName,
      firstName: json.data.firstName,
      lastName: json.data.lastName,
      email: json.data.email,
      status: json.data.status,
      createdAt: json.data.createdAt,
      devices: Array.isArray(json.data.devices) ? json.data.devices : [],
    };
    
    console.log('Transformed data:', transformedData);
    return transformedData;
  } catch (err: unknown) {
    console.log(`Error occurred in getting user info:`, err);
    throw err;
  }
}