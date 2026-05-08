/**
 * Token Management Utility
 * Handles JWT token storage and retrieval from localStorage
 */

const TOKEN_KEY = 'cinemoon_token';
const USER_KEY = 'cinemoon_user';

export interface User {
  MATK: number;
  TENDANGNHAP: string;
  QUYENTRUYCAP: 'Admin' | 'Staff' | 'Customer';
  TRANGTHAITAIKHOAN: string;
}

/**
 * Save JWT token to localStorage
 */
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Clear JWT token from localStorage
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Save user data to localStorage
 */
export function saveUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get user data from localStorage
 */
export function getUser(): User | null {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Clear user data from localStorage
 */
export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Logout - clear token and user
 */
export function logout(): void {
  clearToken();
  clearUser();
}

/**
 * Get Authorization header value
 */
export function getAuthHeader(): string | null {
  const token = getToken();
  return token ? `Bearer ${token}` : null;
}
