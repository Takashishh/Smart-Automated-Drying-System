import { getAuthHeaders } from "../shared/get-auth-headers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface SendEmailParams {
  recipient: string;
  templateId: string;
  variables?: Record<string, string>;
  adminId: string;
}

export async function sendEmail(params: SendEmailParams) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_URL}/email-templates/send-email`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send email");
  }

  const data = await response.json();
  return data.data;
}
