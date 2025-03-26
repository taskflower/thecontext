/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/PaymentService.ts
import { PluginAuthAdapter } from './PluginAuthAdapter';
import { authService } from './authService';

export interface PaymentResult {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

export class PaymentService {
  private API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  private authAdapter: PluginAuthAdapter;

  constructor(appContext?: any) {
    this.authAdapter = new PluginAuthAdapter(appContext);
    console.log('PaymentService initialized with API URL:', this.API_URL);
  }

  async processPayment(userId: string, tokenCount: number, amount: number): Promise<PaymentResult> {
    console.log('Processing payment:', { userId, tokenCount, amount });
    
    try {
      // Validate tokenCount is a positive integer
      if (!Number.isInteger(tokenCount) || tokenCount <= 0) {
        console.error('Invalid token count:', tokenCount);
        return {
          success: false,
          error: 'Token amount must be a positive integer'
        };
      }
      
      // Get authentication token
      const token = await this.getAuthToken();
      
      if (!token) {
        console.error('No authentication token available');
        return {
          success: false,
          error: 'Authentication token not available'
        };
      }
      
      console.log('Making API request to create checkout session');
      
      // API endpoint
      const endpoint = `${this.API_URL}/api/v1/stripe/create-checkout-session`;
      console.log('Endpoint:', endpoint);
      
      // Request payload
      const payload = { tokenAmount: tokenCount };
      console.log('Payload:', payload);
      
      // Make API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', response.status, response.statusText);
      
      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        
        try {
          // Try to parse error JSON
          const errorData = await response.json();
          console.log('Error data:', errorData);
          
          if (errorData.error) {
            errorMessage = typeof errorData.error === 'string' 
              ? errorData.error 
              : errorData.error.message || errorMessage;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch  {
          // If JSON parsing fails, use text content
          try {
            const textContent = await response.text();
            console.log('Response text:', textContent);
            if (textContent) errorMessage += ` - ${textContent}`;
          } catch (textError) {
            console.error('Failed to read response text:', textError);
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse successful response
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (error) {
        console.error('Error parsing response JSON:', error);
        throw new Error('Invalid response format from server');
      }
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        console.error('Invalid response data:', data);
        throw new Error('Invalid response format from server');
      }
      
      // Check for success flag and checkout URL
      if (!data.success) {
        console.error('Server reported failure:', data);
        throw new Error(data.message || data.error || 'Payment creation failed');
      }
      
      if (!data.data || !data.data.checkoutUrl) {
        console.error('No checkout URL in response:', data);
        throw new Error('Payment URL missing in server response');
      }
      
      // Return success with checkout URL
      return {
        success: true,
        checkoutUrl: data.data.checkoutUrl
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown payment error'
      };
    }
  }

  // Get authentication token using available methods
  private async getAuthToken(): Promise<string | null> {
    try {
      // Try with auth adapter first
      const adapterToken = await this.authAdapter.getCurrentUserToken();
      if (adapterToken) {
        return adapterToken;
      }
      
      // Fall back to auth service
      const serviceToken = await authService.getCurrentUserToken();
      if (serviceToken) {
        return serviceToken;
      }
      
      console.warn('Could not retrieve authentication token');
      return null;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  // Calculate token cost (not used in API call as the server calculates this)
  calculateCost(tokenCount: number): number {
    // Example calculation: 0.02 PLN per token
    return tokenCount * 0.02;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();