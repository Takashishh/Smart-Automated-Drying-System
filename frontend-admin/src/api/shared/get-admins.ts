import { auth } from "../../firebase/firebase-config";

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

export async function getAdminsFromAPI(): Promise<AdminData[]> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be signed in to fetch admins");
  }

  const idToken = await currentUser.getIdToken();

  const res = await fetch("http://localhost:3000/admin/get-admins", {
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

  return json?.data ?? [];
}
