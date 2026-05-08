// API Service Layer - Centralized HTTP requests to backend
import { MOCK_PHIM_DATA, MOCK_SUAT_CHIEU_DATA, MOCK_RAP_DATA } from './mockData';

const API_BASE = 'http://localhost:3000/api';
const USE_MOCK_DATA = true; // Toggle to true for development when database is unavailable

// Define response type
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Movie type from backend
interface ApiMovie {
  MAPHIM: string;
  TENPHIM: string;
  THELOAI: string;
  THOILUONG: number;
  DAODIEN: string;
  DIENVIEN: string;
  NGAYPHATHANH: string;
  POSTER: string;
  TRAILER: string;
  MOTA: string;
  GIOIHANTUOI: number;
  TRANGTHAI: string;
}

// Showtime type from backend
interface ApiShowtime {
  MASUAT: string;           // Showtime ID (for booking)
  MAPHIM: string;           // Movie ID
  MAPHONG: string;          // Room ID
  NGAYCHIEU: string;        // Date (YYYY-MM-DD)
  GIOBATDAU: string;        // Start time (HH:MM:SS)
  GIOKETTHUC: string;       // End time (HH:MM:SS)
  TRANGTHAISUAT: string;    // Status
}

// Cinema type from backend
interface ApiCinema {
  MARAP: string;
  TENRAP: string;
  DIACHI: string;
}

/**
 * Generic fetch wrapper with error handling and mock data fallback
 */
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // If USE_MOCK_DATA is enabled, return mock data directly for catalog endpoints
  if (USE_MOCK_DATA && endpoint.includes('/catalog/')) {
    console.log(`[API Mock Mode] Returning mock data for ${endpoint}`);
    if (endpoint === '/catalog/phim') {
      return MOCK_PHIM_DATA as T;
    }
    if (endpoint.includes('/catalog/suat-chieu')) {
      return MOCK_SUAT_CHIEU_DATA as T;
    }
    if (endpoint === '/catalog/rap') {
      return MOCK_RAP_DATA as T;
    }
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Lỗi mạng. Vui lòng kiểm tra kết nối.';
    console.error(`[API Error] ${endpoint}:`, message);
    
    // Fallback to mock data if available and API fails
    if (endpoint.includes('/catalog/')) {
      console.warn(`[API] Falling back to mock data for ${endpoint}`);
      if (endpoint === '/catalog/phim') {
        return MOCK_PHIM_DATA as T;
      }
      if (endpoint.includes('/catalog/suat-chieu')) {
        return MOCK_SUAT_CHIEU_DATA as T;
      }
      if (endpoint === '/catalog/rap') {
        return MOCK_RAP_DATA as T;
      }
    }
    
    throw new Error(message);
  }
}

/**
 * Catalog API - Public endpoints (no authentication)
 */
export const catalogAPI = {
  /**
   * Get all movies
   * GET /catalog/phim
   */
  getMovies: async (): Promise<ApiMovie[]> => {
    return fetchAPI<ApiMovie[]>('/catalog/phim');
  },

  /**
   * Get showtimes with optional filters
   * GET /catalog/suat-chieu?maphim=PH001&ngaychieu=2025-04-26
   */
  getShowtimes: async (maphim?: string, ngaychieu?: string): Promise<ApiShowtime[]> => {
    let endpoint = '/catalog/suat-chieu';
    const params = new URLSearchParams();
    if (maphim) params.append('maphim', maphim);
    if (ngaychieu) params.append('ngaychieu', ngaychieu);
    if (params.toString()) endpoint += `?${params.toString()}`;
    return fetchAPI<ApiShowtime[]>(endpoint);
  },

  /**
   * Get seats in a cinema room
   * GET /catalog/ghe-ngoi?maphong=PC001
   */
  getSeats: async (maphong: string): Promise<any[]> => {
    return fetchAPI<any[]>(`/catalog/ghe-ngoi?maphong=${maphong}`);
  },

  /**
   * Get pricing rules
   * GET /catalog/quy-dinh-gia
   */
  getPricingRules: async (): Promise<any[]> => {
    return fetchAPI<any[]>('/catalog/quy-dinh-gia');
  },

  /**
   * Get promotions
   * GET /catalog/khuyen-mai
   */
  getPromotions: async (): Promise<any[]> => {
    return fetchAPI<any[]>('/catalog/khuyen-mai');
  },

  /**
   * Get all cinemas
   * GET /catalog/rap
   */
  getCinemas: async (): Promise<ApiCinema[]> => {
    return fetchAPI<ApiCinema[]>('/catalog/rap');
  },
};

/**
 * Authentication API - Protected endpoints
 */
export const authAPI = {
  /**
   * Login with username/password
   * POST /auth/login
   */
  login: async (username: string, password: string): Promise<any> => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  /**
   * Register new user
   * POST /auth/register
   */
  register: async (username: string, password: string, email: string): Promise<any> => {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    });
  },

  /**
   * Get current user info
   * GET /auth/me
   */
  getCurrentUser: async (token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Kh\u00f4ng c\u00f3 token. Vui l\u00f2ng \u0111\u0103ng nh\u1eadp');
    }
    
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const json = await response.json();
    if (!json.success) {
      throw new Error(json.message || 'L\u1ed7i t\u1eeb server');
    }
    
    return json.data;
  },
};

/**
 * Booking API - Protected endpoints
 */
export const bookingAPI = {
  /**
   * Calculate ticket price based on seat type and time
   * POST /booking/calculate-price
   */
  calculatePrice: async (data: any, token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Kh\u00f4ng c\u00f3 token. Vui l\u00f2ng \u0111\u0103ng nh\u1eadp');
    }
    
    return fetchAPI('/booking/calculate-price', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  /**
   * Apply voucher code
   * POST /booking/apply-voucher
   */
  applyVoucher: async (makhuyenmai: string, totalAmount: number, token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Kh\u00f4ng c\u00f3 token. Vui l\u00f2ng \u0111\u0103ng nh\u1eadp');
    }
    
    return fetchAPI('/booking/apply-voucher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ makhuyenmai, totalAmount }),
    });
  },
};

// Export types
export type { ApiResponse, ApiMovie, ApiShowtime, ApiCinema };
