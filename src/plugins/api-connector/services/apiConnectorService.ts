// src/plugins/api-connector/services/apiConnectorService.ts
import { authService } from "@/services/authService";

interface ApiRequestPayload {
  messages: Array<{
    role: string;
    content: string;
  }>;
  userId: string;
}

interface ApiResponse {
  success: boolean;
  data?: {
    message?: {
      content: string;
    };
  };
  error?: string;
}

export const apiConnectorService = {
  /**
   * Sends a request to the LLM API
   * @param nodePrompt The prompt from the node
   * @param customContent The content from the text input field
   * @param apiUrl The API endpoint URL
   * @param userId The user ID
   * @returns Promise with the LLM content
   */
  async sendLlmRequest(
    nodePrompt: string,
    customContent: string,
    apiUrl: string,
    userId: string
  ): Promise<string> {
    const token = await authService.getCurrentUserToken();

    if (!token) {
      throw new Error("Failed to get authentication token");
    }

    const payload: ApiRequestPayload = {
      messages: [
        { role: "user", content: nodePrompt ? nodePrompt : "" },
        { role: "user", content: customContent ? nodePrompt : "" },
      ],
      userId: userId,
    };

    // Get API URL from environment or config
    const baseApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const endpoint = apiUrl.startsWith("http")
      ? apiUrl
      : `${baseApiUrl}${apiUrl.startsWith("/") ? "" : "/"}${apiUrl}`;

    // Send the API request
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    // Parse the response
    const data: ApiResponse = await response.json();
    console.log("API Connector Service: Received response:", data);

    // Extract the actual LLM content from the response
    const llmContent = data.data?.message?.content || "Brak odpowiedzi";

    return llmContent;
  },
};
