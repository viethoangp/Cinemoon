// API Service Layer - Centralized HTTP requests to backend
import { MOCK_PHIM_DATA, MOCK_SUAT_CHIEU_DATA, MOCK_RAP_DATA } from './mockData';

const API_BASE = 'http://localhost:3000/api';
const USE_MOCK_DATA = false; // Set to true for mock, false for real API from Oracle

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

// Dashboard Stats types
interface DashboardKPI {
  revenue: number;
  totalTickets: number;
  newCustomers: number;
}

interface TopMovie {
  maphim: string;
  tenphim: string;
  poster: string;
  doanhthu: number;
  tongVe: number;
}

interface TopCustomer {
  makh: string;
  hoten: string;
  tongChiTieu: number;
  soGiaoDich: number;
}

interface OccupancyRate {
  masuat: string;
  ngaychieu: string;
  giobatdau: string;
  tenphim: string;
  maphong: string;
  succhuaghe: number;
  soVeBan: number;
  tyLeLapDay: number;
}

interface MonthlyRevenue {
  month: number;
  revenue: number;
}

interface DashboardStats {
  kpi: DashboardKPI;
  monthlyRevenue: MonthlyRevenue[];
  topMovies: TopMovie[];
  topCustomers: TopCustomer[];
  occupancyRate: OccupancyRate[];
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
    
    const json = await response.json();
    if (!response.ok || !json.success) {
      // Sẽ ném ra câu: "Không thể xóa vì suất chiếu này đã có người đặt ghế..."
      throw new Error(json.message || `Lỗi HTTP ${response.status}`); 
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
  getShowtimes: async (maphim?: string, ngaychieu?: string, marap?: string): Promise<ApiShowtime[]> => {
    let endpoint = '/catalog/suat-chieu';
    const params = new URLSearchParams();
    if (maphim) params.append('maphim', maphim);
    if (ngaychieu) params.append('ngaychieu', ngaychieu);
    if (marap) params.append('marap', marap); 
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

  /**
   * Get user profile with booking history
   * GET /auth/me (alias for ProfileScreen)
   */
  getUserProfile: async (token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
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
      throw new Error(json.message || 'Lỗi từ server');
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
  holdSeats: async (masuat: string, seatIds: string[], token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập để tiếp tục.');
    }

    return fetchAPI('/booking/hold', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ masuat, seatIds }),
    });
  },

  /**
   * Complete checkout and create booking transaction
   * POST /booking/checkout
   */
  checkout: async (data: any, token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập để tiếp tục.');
    }

    return fetchAPI('/booking/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });
  },
};

/**
 * Admin API - Protected admin-only endpoints
 */

// Movie types for admin
interface Movie {
  maphim: string;
  tenphim: string;
  poster?: string;
  thoigianphim: number;
  ngayPhatHanhThuyetMinh?: string;
  daiPhim?: string;
  directorName?: string;
  soSuatChieu?: number;
  doanhThuThang?: number;
  mota?: string;
  dacdiem?: string;
}

interface Genre {
  madai: string;
  tendai: string;
}

interface MovieListResponse {
  movies: Movie[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// Showtime types for admin
interface Room {
  maphong: string;
  tenrap: string;
  succhuaghe: number;
}

interface MovieDropdown {
  maphim: string;
  tenphim: string;
  thoiluong: number;
}

interface Showtime {
  masuat: string;
  maphim: string;
  tenphim: string;
  maphong: string;
  succhuaghe: number;
  ngaychieu: string;
  giobatdau: string;
  gioketthuc: string;
  trangthaisuat: string;
  soVeBan: number;
  tyLeLapDay: number;
}

interface ShowtimeListResponse {
  showtimes: Showtime[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// Voucher types for admin
interface Voucher {
  makhuyenmai: string;
  tenchuongtrinh: string;
  giatrigiam: number;
  dieukienapdung: number;
  ngaybatdau: string;
  ngayketthuc: string;
  soLanSuDung?: number;
  trangThai?: string;
}

interface VoucherListResponse {
  vouchers: Voucher[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export const adminAPI = {
  /**
   * Get dashboard statistics
   * GET /admin/stats/overview
   */
  getDashboardStats: async (token?: string): Promise<DashboardStats> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/stats/overview`, {
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
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  // ==================== PHASE 2: Movie Management ====================

  /**
   * Get movies list with pagination and search
   * GET /admin/phim?search=...&page=1&limit=10
   */
  getMovies: async (params?: { search?: string; page?: number; limit?: number }, token?: string): Promise<MovieListResponse> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const endpoint = `/admin/phim${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
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
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  /**
   * Get single movie details
   * GET /admin/phim/:maphim
   */
  getMovieById: async (maphim: string, token?: string): Promise<Movie> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/phim/${maphim}`, {
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
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  /**
   * Create new movie
   * POST /admin/phim-create
   */
  createMovie: async (data: Partial<Movie>, token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/phim-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  /**
   * Update movie
   * PUT /admin/phim/:maphim
   */
  updateMovie: async (maphim: string, data: Partial<Movie>, token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/phim/${maphim}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  /**
   * Delete movie
   * DELETE /admin/phim/:maphim
   */
  deleteMovie: async (maphim: string, token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/phim/${maphim}`, {
      method: 'DELETE',
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
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  /**
   * Get genres/categories for dropdown
   * GET /admin/dai
   */
  getGenres: async (token?: string): Promise<Genre[]> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/dai`, {
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
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  // ==================== PHASE 3: Showtime Management ====================

  /**
   * Get showtimes list with pagination and search
   * GET /admin/suat-chieu?search=...&page=1&limit=10
   */
  getShowtimes: async (params?: { search?: string; page?: number; limit?: number }, token?: string): Promise<ShowtimeListResponse> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const endpoint = `/admin/suat-chieu${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
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
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  /**
   * Get cinema rooms for dropdown
   * GET /admin/phong-chieu-list
   */
  getRooms: async (token?: string): Promise<Room[]> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/phong-chieu-list`, {
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
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  /**
   * Get movies list for dropdown
   * GET /admin/phim-list
   */
  getMoviesDropdown: async (token?: string): Promise<MovieDropdown[]> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/phim-list`, {
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
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  /**
   * Create new showtime
   * POST /admin/suat-chieu-create
   */
  createShowtime: async (data: Partial<Showtime>, token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/suat-chieu-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  /**
   * Update showtime
   * PUT /admin/suat-chieu/:masuat
   */
  updateShowtime: async (masuat: string, data: Partial<Showtime>, token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/suat-chieu/${masuat}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  /**
   * Delete showtime
   * DELETE /admin/suat-chieu/:masuat
   */
  deleteShowtime: async (masuat: string, token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/suat-chieu/${masuat}`, {
      method: 'DELETE',
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
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  // ==================== PHASE 4: Voucher Management ====================

  /**
   * Get vouchers list with pagination and search
   * GET /admin/khuyen-mai?search=...&page=1&limit=10
   */
  getVouchers: async (params?: { search?: string; page?: number; limit?: number }, token?: string): Promise<VoucherListResponse> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const endpoint = `/admin/khuyen-mai${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
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
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  /**
   * Create new voucher
   * POST /admin/khuyen-mai-create
   */
  createVoucher: async (data: Partial<Voucher>, token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/khuyen-mai-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  /**
   * Update voucher
   * PUT /admin/khuyen-mai/:makhuyenmai
   */
  updateVoucher: async (makhuyenmai: string, data: Partial<Voucher>, token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/khuyen-mai/${makhuyenmai}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    if (!json.success) {
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },

  /**
   * Delete voucher
   * DELETE /admin/khuyen-mai/:makhuyenmai
   */
  deleteVoucher: async (makhuyenmai: string, token?: string): Promise<any> => {
    const authToken = token || localStorage.getItem('cinemoon_token');
    if (!authToken) {
      throw new Error('Không có token. Vui lòng đăng nhập');
    }

    const response = await fetch(`${API_BASE}/admin/khuyen-mai/${makhuyenmai}`, {
      method: 'DELETE',
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
      throw new Error(json.message || 'Lỗi từ server');
    }

    return json.data;
  },
};

// Export types
export type { ApiResponse, ApiMovie, ApiShowtime, ApiCinema, DashboardStats, DashboardKPI, TopMovie, TopCustomer, OccupancyRate, Movie, Genre, MovieListResponse, Showtime, ShowtimeListResponse, Room, MovieDropdown, Voucher, VoucherListResponse };
