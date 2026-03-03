import { auth } from "../../firebase/firebase-config";
import type { PaginatedResult } from "../users/get-users";

export interface AdminData {
  uid?: string; // Firebase UID
  adminId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  role: string;
  status: string;
  emailVerified?: boolean;
  createdDate?: string | null;
  lastLogin?: string | null;
}

export async function getAdminsFromAPI(page: number = 1, limit: number = 10): Promise<PaginatedResult<AdminData>> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be signed in to fetch admins");
  }

  const idToken = await currentUser.getIdToken();

  const url = new URL("http://localhost:3000/admin/get-admins");
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    console.error("Failed to fetch admins:", json);
    throw new Error('Failed to load admins');
  }

  return {
    data: Array.isArray(json?.data) ? json.data : [],
    pagination: json?.pagination ?? {
      currentPage: page,
      pageSize: limit,
      totalItems: 0,
      totalPages: 0,
    },
  };
}
