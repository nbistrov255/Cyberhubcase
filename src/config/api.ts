/**
 * API Configuration
 * Базовая конфигурация для всех запросов к backend
 */

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://91.107.120.48:3000';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  createSession: `${API_BASE}/api/auth/session`,
  getProfile: `${API_BASE}/api/profile`,
  logout: `${API_BASE}/api/auth/logout`,
  
  // Cases
  openCase: `${API_BASE}/api/cases/open`,
  getCaseById: (id: string) => `${API_BASE}/api/cases/${id}`,
  
  // Inventory
  getInventory: `${API_BASE}/api/inventory`,
  claimItem: `${API_BASE}/api/inventory/claim`,
  sellItem: `${API_BASE}/api/inventory/sell`,
  
  // User
  updateTradeLink: `${API_BASE}/api/user/tradelink`,
  
  // Admin
  getRequests: `${API_BASE}/api/admin/requests`,
  approveRequest: `${API_BASE}/api/admin/requests/approve`,
  denyRequest: `${API_BASE}/api/admin/requests/deny`,
  returnRequest: `${API_BASE}/api/admin/requests/return`,
  
  // Stats & Drops
  getRecentDrops: `${API_BASE}/api/drops/recent`,
  getPublicStats: `${API_BASE}/api/stats/public`,
} as const;

/**
 * Helper для получения токена из localStorage
 */
export const getSessionToken = (): string | null => {
  return localStorage.getItem('session_token');
};

/**
 * Helper для сохранения токена в localStorage
 */
export const setSessionToken = (token: string): void => {
  localStorage.setItem('session_token', token);
};

/**
 * Helper для удаления токена из localStorage
 */
export const clearSessionToken = (): void => {
  localStorage.removeItem('session_token');
};

/**
 * Helper для создания headers с Authorization
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = getSessionToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};
