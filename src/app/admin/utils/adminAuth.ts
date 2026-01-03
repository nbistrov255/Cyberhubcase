/**
 * Admin Authentication Helpers
 * Utilities for managing admin session tokens
 */

const ADMIN_TOKEN_KEY = 'admin_session_token';

/**
 * Get admin session token from localStorage
 */
export const getAdminToken = (): string | null => {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

/**
 * Save admin session token to localStorage
 */
export const setAdminToken = (token: string): void => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

/**
 * Remove admin session token from localStorage
 */
export const clearAdminToken = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

/**
 * Get admin auth headers with token
 */
export const getAdminAuthHeaders = (): HeadersInit => {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
