import { auth } from "../../firebase/firebase-config";

export interface CreateAdminPayload {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
}

export interface CreateAdminResult {
  message: string;
  adminId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string | null;
}

export async function createAdminAccount(
  payload: CreateAdminPayload
): Promise<CreateAdminResult> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You must be signed in to create an admin");
  }

  const idToken = await currentUser.getIdToken();

  const res = await fetch("http://localhost:3000/admin/create-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error('Failed to create admin');
  }

  return json?.data ?? json;
}
