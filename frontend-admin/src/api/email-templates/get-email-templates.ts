import { getAuthHeaders } from "../shared/get-auth-headers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function getEmailTemplates(category?: string) {
  const headers = await getAuthHeaders();
  const url = new URL(`${API_URL}/email-templates/get-templates`);
  
  if (category) {
    url.searchParams.append("category", category);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch email templates");
  }

  const data = await response.json();
  return data.data;
}
