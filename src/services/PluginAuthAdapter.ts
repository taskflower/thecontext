/**
 * Authentication adapter for plugins
 * Provides an interface for interacting with the authorization system
 */
import { AuthUser } from "./authService";

/**
 * Context item structure
 */
export interface ContextItem {
  /** The unique identifier of the context item */
  id: string;
  /** The title of the context item */
  title: string;
  /** The content of the context item */
  content: string;
  /** Additional properties */
  [key: string]: unknown;
}

/**
 * Application context interface
 */
export interface ApplicationContext {
  /** Authentication context */
  authContext?: {
    /** Current authenticated user */
    currentUser?: AuthUser;
    /** Get authentication token */
    getToken?: () => Promise<string | null>;
    /** Refresh user data */
    refreshUserData?: () => Promise<void>;
    /** Decrease available tokens */
    decreaseTokens?: (amount: number) => void;
  };
  /** Get context items */
  getContextItems?: () => ContextItem[];
  /** Current node data */
  currentNode?: Record<string, unknown>;
  /** Additional properties */
  [key: string]: unknown;
}

/**
 * Authentication adapter for plugins
 * Provides a consistent interface for plugins to interact with the authentication system
 */
export class PluginAuthAdapter {
  private authAttempts = 0;
  
  /**
   * Creates a new instance of the PluginAuthAdapter
   * @param appContext The application context containing auth information
   */
  constructor(public readonly appContext: ApplicationContext) {
    console.log("PluginAuthAdapter initialized with appContext:", !!appContext);
  }
  
  /**
   * Gets the current user data from the application context
   * @returns Promise resolving to the current user or null if not available
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      this.authAttempts++;
      
      // Check if we have direct access to the authentication context
      if (this.appContext?.authContext?.currentUser) {
        console.log("Retrieved user from auth context");
        return this.appContext.authContext.currentUser;
      }
      
      // If we're in development mode, return a mock user
      if (import.meta.env.DEV) {
        console.log("Dev mode - returning mock user");
        return {
          uid: "dev-user",
          email: "dev@example.com",
          availableTokens: 1000,
          createdAt: new Date(),
          lastLoginAt: new Date()
        };
      }
      
      console.warn("No auth context available");
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }
  
  /**
   * Gets the user's authentication token from the auth context
   * @returns Promise resolving to the token string or null if not available
   */
  async getCurrentUserToken(): Promise<string | null> {
    try {
      // Check if we have access to the getToken method in the auth context
      if (this.appContext?.authContext?.getToken) {
        const token = await this.appContext.authContext.getToken();
        return token;
      }
      
      // In development mode, return a mock token
      if (import.meta.env.DEV) {
        return "dev-token-123456";
      }
      
      console.warn("No getToken method available in auth context");
      return null;
    } catch (error) {
      console.error("Error getting user token:", error);
      return null;
    }
  }
  
  /**
   * Gets the number of authentication attempts
   * @returns The number of authentication attempts
   */
  getAuthAttempts(): number {
    return this.authAttempts;
  }
  
  /**
   * Refreshes the user data through the auth context
   * @returns Promise that resolves when the refresh is complete
   */
  async refreshUserData(): Promise<void> {
    try {
      if (this.appContext?.authContext?.refreshUserData) {
        await this.appContext.authContext.refreshUserData();
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  }

  /**
   * Decreases the number of available tokens
   * @param amount The number of tokens to decrease
   */
  decreaseTokens(amount: number): void {
    try {
      if (this.appContext?.authContext?.decreaseTokens) {
        this.appContext.authContext.decreaseTokens(amount);
      }
    } catch (error) {
      console.error("Error decreasing tokens:", error);
    }
  }
  
  /**
   * Gets a context item by title
   * This method was added to facilitate access to the context system
   * @param title The title of the context item to find
   * @returns The found context item or null if not found
   */
  getContextItemByTitle(title: string): ContextItem | null {
    try {
      if (typeof this.appContext?.getContextItems === 'function') {
        const contextItems = this.appContext.getContextItems();
        return contextItems.find((item: ContextItem) => item.title === title) || null;
      }
      return null;
    } catch (error) {
      console.error("Error getting context item:", error);
      return null;
    }
  }
  
  /**
   * Gets all context items from the application context
   * @returns Array of context items or empty array if not available
   */
  getContextItems(): ContextItem[] {
    try {
      if (typeof this.appContext?.getContextItems === 'function') {
        return this.appContext.getContextItems();
      }
      return [];
    } catch (error) {
      console.error("Error getting context items:", error);
      return [];
    }
  }
}