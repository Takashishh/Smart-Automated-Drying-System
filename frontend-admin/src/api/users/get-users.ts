export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

const DEFAULT_PAGINATION: PaginationMeta = {
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
};

export async function getUsers(page: number = 1, limit: number = 10): Promise<PaginatedResult<any>> {
  try {
    const url = new URL("http://localhost:3000/users/get-users");
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error('Failed to load users');
    }

    const json = await res.json();
    return {
      data: Array.isArray(json?.data) ? json.data : [],
      pagination: json?.pagination ?? DEFAULT_PAGINATION,
    };

  } catch (err: unknown) {
    console.error(`Error occurred in getting users: ${err}`);
    throw err;
  }
}
