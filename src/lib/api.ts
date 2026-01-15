/**
 * OfficeRnD Flex 2 API client
 *
 * Implements OAuth 2.0 client credentials flow and data fetching
 * for members and companies with pagination support.
 */

import type { ApiMember, ApiCompany, ApiPaginatedResponse } from "./types";

// ============================================================================
// Configuration
// ============================================================================

const TOKEN_ENDPOINT = "https://identity.officernd.com/oauth/token";
const API_BASE_URL = "https://app.officernd.com/api/v2/organizations";
const SCOPES = "flex.community.members.read flex.community.companies.read";

// ============================================================================
// Types
// ============================================================================

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface ApiClientConfig {
  clientId: string;
  clientSecret: string;
  orgSlug: string;
}

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly endpoint?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ============================================================================
// Token Management
// ============================================================================

/**
 * Cached token and expiration time
 */
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Obtains an OAuth 2.0 access token using client credentials flow.
 *
 * The token is cached and reused until it expires (with a 60-second buffer).
 * Note: Token endpoint has a 5 req/min rate limit.
 *
 * @param config - API client configuration
 * @returns The access token string
 * @throws ApiError if authentication fails
 */
export async function getAccessToken(config: ApiClientConfig): Promise<string> {
  // Return cached token if still valid (with 60-second buffer)
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 60000) {
    return cachedToken;
  }

  const { clientId, clientSecret } = config;

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: SCOPES,
  });

  let response: Response;
  try {
    response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
  } catch (error) {
    throw new ApiError(
      `Failed to connect to authentication server: ${error instanceof Error ? error.message : "Unknown error"}`,
      undefined,
      TOKEN_ENDPOINT
    );
  }

  if (!response.ok) {
    let errorMessage = `Authentication failed with status ${response.status}`;
    try {
      const errorData = (await response.json()) as Record<string, unknown>;
      if (errorData.error_description) {
        errorMessage = `Authentication failed: ${errorData.error_description}`;
      } else if (errorData.error) {
        errorMessage = `Authentication failed: ${errorData.error}`;
      }
    } catch {
      // Use default error message if response isn't JSON
    }
    throw new ApiError(errorMessage, response.status, TOKEN_ENDPOINT);
  }

  let tokenData: OAuthTokenResponse;
  try {
    tokenData = (await response.json()) as OAuthTokenResponse;
  } catch {
    throw new ApiError(
      "Invalid response from authentication server: expected JSON",
      response.status,
      TOKEN_ENDPOINT
    );
  }

  if (!tokenData.access_token) {
    throw new ApiError(
      "Invalid response from authentication server: missing access_token",
      response.status,
      TOKEN_ENDPOINT
    );
  }

  // Cache the token
  cachedToken = tokenData.access_token;
  tokenExpiresAt = now + tokenData.expires_in * 1000;

  return cachedToken;
}

/**
 * Clears the cached token. Useful for testing or forcing re-authentication.
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
}

// ============================================================================
// API Fetching Helpers
// ============================================================================

/**
 * Makes an authenticated GET request to the OfficeRnD API.
 *
 * @param endpoint - The API endpoint (full URL)
 * @param token - The access token
 * @returns The parsed JSON response
 * @throws ApiError if the request fails
 */
async function authenticatedFetch<T>(
  endpoint: string,
  token: string
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
  } catch (error) {
    throw new ApiError(
      `Failed to connect to API: ${error instanceof Error ? error.message : "Unknown error"}`,
      undefined,
      endpoint
    );
  }

  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    try {
      const errorData = (await response.json()) as Record<string, unknown>;
      if (errorData.message) {
        errorMessage = `API error: ${errorData.message}`;
      } else if (errorData.error) {
        errorMessage = `API error: ${errorData.error}`;
      }
    } catch {
      // Use default error message if response isn't JSON
    }
    throw new ApiError(errorMessage, response.status, endpoint);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(
      "Invalid response from API: expected JSON",
      response.status,
      endpoint
    );
  }
}

/**
 * Fetches all pages of a paginated API endpoint.
 *
 * @param baseUrl - The base URL without pagination parameters
 * @param token - The access token
 * @returns All results from all pages combined
 * @throws ApiError if any request fails
 */
async function fetchAllPages<T>(
  baseUrl: string,
  token: string
): Promise<T[]> {
  const allResults: T[] = [];
  let cursor: string | undefined = undefined;
  let hasMore = true;

  while (hasMore) {
    const url: string = cursor
      ? `${baseUrl}?$cursorNext=${cursor}`
      : baseUrl;
    const response: ApiPaginatedResponse<T> =
      await authenticatedFetch<ApiPaginatedResponse<T>>(url, token);

    allResults.push(...response.results);
    cursor = response.cursorNext;
    hasMore = cursor !== undefined;
  }

  return allResults;
}

// ============================================================================
// Public API Functions
// ============================================================================

/**
 * Fetches all members from the OfficeRnD API.
 *
 * Handles pagination automatically by following cursorNext until
 * all members have been retrieved.
 *
 * @param config - API client configuration
 * @returns Array of all members
 * @throws ApiError if the request fails
 */
export async function fetchMembers(
  config: ApiClientConfig
): Promise<ApiMember[]> {
  const token = await getAccessToken(config);
  const endpoint = `${API_BASE_URL}/${config.orgSlug}/members`;

  return fetchAllPages<ApiMember>(endpoint, token);
}

/**
 * Fetches all companies from the OfficeRnD API.
 *
 * Handles pagination automatically by following cursorNext until
 * all companies have been retrieved.
 *
 * @param config - API client configuration
 * @returns Array of all companies
 * @throws ApiError if the request fails
 */
export async function fetchCompanies(
  config: ApiClientConfig
): Promise<ApiCompany[]> {
  const token = await getAccessToken(config);
  const endpoint = `${API_BASE_URL}/${config.orgSlug}/companies`;

  return fetchAllPages<ApiCompany>(endpoint, token);
}

// ============================================================================
// Configuration Helpers
// ============================================================================

/**
 * Creates an API client configuration from environment variables.
 *
 * @returns API client configuration
 * @throws Error if required environment variables are missing
 */
export function getConfigFromEnv(): ApiClientConfig {
  const clientId = import.meta.env.OFFICERND_CLIENT_ID;
  const clientSecret = import.meta.env.OFFICERND_CLIENT_SECRET;
  const orgSlug = import.meta.env.OFFICERND_ORG_SLUG;

  const missing: string[] = [];
  if (!clientId) missing.push("OFFICERND_CLIENT_ID");
  if (!clientSecret) missing.push("OFFICERND_CLIENT_SECRET");
  if (!orgSlug) missing.push("OFFICERND_ORG_SLUG");

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  return { clientId, clientSecret, orgSlug };
}
