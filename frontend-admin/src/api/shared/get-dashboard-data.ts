export async function getDashboardData() {
  try {
    const res = await fetch("http://localhost:3000/dashboard/dashboard-data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error('Failed to load dashboard');
    }

    const json = await res.json(); 
    console.log(json.data);
    return json.data;
  } catch (err: unknown) {
    console.error(`Error in getting dashboard data:`, err);
    throw err;
  }
}
