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