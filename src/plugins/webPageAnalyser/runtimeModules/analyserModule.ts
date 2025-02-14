// src/plugins/webPageAnalyser/runtimeModules/analyserModule.ts
import { User } from "firebase/auth";
import { tokenService } from "@/services/tokenService";

interface APIError {
  code: string;
  message: string;
}

interface AnalyserResponse {
  success: boolean;
  content: string;
  error?: {
    code: string;
    message: string;
  };
}

class AnalyserModule {
  private API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  async analyzeWebPage(
    analysisType: string,
    url: string,
    user: User
  ): Promise<AnalyserResponse> {
    try {
      const token = await tokenService.getToken(user);

      // Dodajemy logowanie tutaj, przed fetch
      console.log("Token being sent:", token.slice(0, 10) + "...");

      const response = await fetch(
        `${
          this.API_URL
        }/api/v1/services/analyze-website/${analysisType}?url=${encodeURIComponent(
          url
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Usunięty Content-Type, bo to GET
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error) {
          if (
            errorData.error.code === "auth/invalid-token" ||
            errorData.error.code === "auth/token-expired"
          ) {
            tokenService.clearCache();
          }
          throw errorData.error;
        }
        throw new Error("Website analysis failed");
      }

      const result = await response.json();

      if (!result || typeof result.content !== "string") {
        throw {
          code: "INVALID_RESPONSE",
          message: "Invalid response format from analysis service",
        };
      }

      return {
        success: true,
        content: result.content,
      };
    } catch (error: unknown) {
      if (error && typeof error === "object" && "code" in error) {
        const apiError = error as APIError;
        if (
          apiError.code === "auth/invalid-token" ||
          apiError.code === "auth/token-expired"
        ) {
          tokenService.clearCache();
        }
        throw apiError;
      }

      throw {
        code: "UNKNOWN_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during analysis",
      };
    }
  }
}
export const analyserModule = new AnalyserModule();
