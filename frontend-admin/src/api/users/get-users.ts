export async function getUsers() {
  try {
    const res = await fetch("http://localhost:3000/users/get-users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error('Failed to load users');
    }

    const json = await res.json();
    return json.data; 

  } catch (err: unknown) {
    console.error(`Error occurred in getting users: ${err}`);
    throw err;
  }
}
