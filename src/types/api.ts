/**
 * API Types
 * Типы для запросов и ответов API
 */

// Case types
export type CaseType = 'daily' | 'monthly';

export interface CaseInfo {
  id: string;
  type: CaseType;
  threshold: number;
  available: boolean;
  progress: number;
}

// Profile
export interface UserProfile {
  uuid: string;
  nickname: string;
  dailySum: number;
  monthlySum: number;
  cases: CaseInfo[];
}

// Auth Session
export interface CreateSessionRequest {
  login: string;
  password: string;
}

export interface CreateSessionResponse {
  success: boolean;
  session_token: string;
  profile: UserProfile;
}

// Get Profile
export interface GetProfileResponse {
  success: boolean;
  profile: UserProfile;
}

// Open Case
export interface OpenCaseRequest {
  caseId: string;
}

export interface Prize {
  id: string;
  name: string;
  image: string;
  rarity: string;
  value?: number;
}

export interface OpenCaseResponse {
  success: boolean;
  prize: Prize;
}

// Logout
export interface LogoutResponse {
  success: boolean;
}

// Error Response
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}
