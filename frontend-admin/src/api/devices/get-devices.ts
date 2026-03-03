import type { PaginatedResult } from "../users/get-users";

export async function getDevices(page: number = 1, limit: number = 10): Promise<PaginatedResult<any>> {
  try {
    const url = new URL("http://localhost:3000/devices/get-devices");
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error('Failed to load devices');
    }

    const json = await res.json();

    return {
      data: Array.isArray(json?.data) ? json.data : [],
      pagination: json?.pagination ?? {
        currentPage: page,
        pageSize: limit,
        totalItems: 0,
        totalPages: 0,
      },
    };
  } catch (err: unknown) {
    console.error("Error fetching devices:", err);
    throw err;
  }
}