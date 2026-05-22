import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  BarChart2, Film, Calendar, Tag, LogOut, TrendingUp, Ticket, Users,
  Flame, Plus, Search, Edit2, Trash2, X, Check, ChevronUp, ChevronDown, AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { MOVIES } from '../../context/AppContext';
import { adminAPI } from '../../../services/api';
import type { DashboardStats, Movie, Genre, MovieListResponse, Showtime, ShowtimeListResponse, Room, MovieDropdown, Voucher, VoucherListResponse } from '../../../services/api';
import { MovieFormModal } from './MovieFormModal';
import { ShowtimeFormModal } from './ShowtimeFormModal';
import { VoucherFormModal } from './VoucherFormModal';

const formatCurrency = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + ' triệu';
  return n.toLocaleString('vi-VN') + 'đ';
};

const formatCurrencyVND = (amount: number) => {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + ' tỷ';
  if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + ' triệu';
  if (amount >= 1_000) return (amount / 1_000).toFixed(0) + 'k';
  return amount.toLocaleString('vi-VN');
};

const REVENUE_DATA = [
  { month: 'Th.11', revenue: 1.2, tickets: 1420 },
  { month: 'Th.12', revenue: 1.8, tickets: 2100 },
  { month: 'Th.1', revenue: 1.5, tickets: 1750 },
  { month: 'Th.2', revenue: 2.1, tickets: 2450 },
  { month: 'Th.3', revenue: 1.9, tickets: 2200 },
  { month: 'Th.4', revenue: 2.6, tickets: 3050 },
];

const ADMIN_MOVIES = MOVIES.map((m, i) => ({
  ...m,
  status: i % 3 === 2 ? 'upcoming' : 'showing',
  ticketsSold: [1250, 980, 750, 1100, 1840, 920][i],
  revenue: [112_500_000, 83_300_000, 60_000_000, 82_500_000, 174_800_000, 82_800_000][i],
}));

type TabType = 'stats' | 'movies' | 'schedule' | 'voucher';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-2">{label}</p>
        <p className="text-white text-sm font-semibold">{payload[0].value} tỷ đồng</p>
      </div>
    );
  }
  return null;
};

export const AdminScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Dashboard Stats State
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Movies Tab State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [moviesError, setMoviesError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // Schedule Tab State
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [showtimesError, setShowtimesError] = useState<string | null>(null);
  const [searchShowtime, setSearchShowtime] = useState('');
  const [currentPageShowtime, setCurrentPageShowtime] = useState(1);
  const [totalPagesShowtime, setTotalPagesShowtime] = useState(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [moviesDropdown, setMoviesDropdown] = useState<MovieDropdown[]>([]);
  const [showShowtimeModal, setShowShowtimeModal] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);

  // Voucher Tab State
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [vouchersError, setVouchersError] = useState<string | null>(null);
  const [searchVoucher, setSearchVoucher] = useState('');
  const [currentPageVoucher, setCurrentPageVoucher] = useState(1);
  const [totalPagesVoucher, setTotalPagesVoucher] = useState(1);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Fetch dashboard stats on component mount and when activeTab changes
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        const data = await adminAPI.getDashboardStats();
        setDashboardData(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Lỗi khi tải dữ liệu';
        setStatsError(message);
        console.error('Dashboard fetch error:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  // Fetch movies when movies tab is active
  useEffect(() => {
    if (activeTab === 'movies') {
      fetchMovies(1);
      fetchGenres();
    }
  }, [activeTab]);

  // Debounce search
  useEffect(() => {
    if (activeTab === 'movies' && searchTerm !== '') {
      const debounceTimer = setTimeout(() => {
        fetchMovies(1);
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, activeTab]);

  // Fetch showtimes when schedule tab is active
  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchShowtimes(1);
      fetchRooms();
      fetchMoviesDropdown();
    }
  }, [activeTab]);

  // Debounce search for showtimes
  useEffect(() => {
    if (activeTab === 'schedule' && searchShowtime !== '') {
      const debounceTimer = setTimeout(() => {
        fetchShowtimes(1);
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchShowtime, activeTab]);

  // Fetch vouchers when voucher tab is active
  useEffect(() => {
    if (activeTab === 'voucher') {
      fetchVouchers(1);
    }
  }, [activeTab]);

  // Debounce search for vouchers
  useEffect(() => {
    if (activeTab === 'voucher' && searchVoucher !== '') {
      const debounceTimer = setTimeout(() => {
        fetchVouchers(1);
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchVoucher, activeTab]);

  // ==================== Movies Functions ====================

  const fetchMovies = async (page: number) => {
    try {
      setMoviesLoading(true);
      setMoviesError(null);
      const response = await adminAPI.getMovies({
        search: searchTerm,
        page,
        limit: 10,
      });
      setMovies(response.movies);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi tải danh sách phim';
      setMoviesError(message);
      console.error('Movies fetch error:', error);
    } finally {
      setMoviesLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await adminAPI.getGenres();
      setGenres(response);
    } catch (error) {
      console.error('Genres fetch error:', error);
    }
  };

  const handleAddMovie = () => {
    setEditingMovie(null);
    setShowMovieModal(true);
  };

  const handleEditMovie = async (movie: Movie) => {
    try {
      const fullMovie = await adminAPI.getMovieById(movie.maphim);
      setEditingMovie(fullMovie);
      setShowMovieModal(true);
    } catch (error) {
      setMoviesError('Lỗi tải chi tiết phim');
    }
  };

  const handleSaveMovie = async (formData: Partial<Movie>) => {
    try {
      if (editingMovie) {
        // Update
        await adminAPI.updateMovie(editingMovie.maphim, formData);
        setMoviesError(null);
      } else {
        // Create
        await adminAPI.createMovie(formData);
        setMoviesError(null);
      }
      setShowMovieModal(false);
      fetchMovies(1); // Refresh list
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi lưu phim';
      setMoviesError(message);
    }
  };

  const handleDeleteMovie = async (maphim: string, tenphim: string) => {
    if (!confirm(`Xác nhận xóa phim "${tenphim}"?`)) return;
    try {
      await adminAPI.deleteMovie(maphim);
      setMoviesError(null);
      fetchMovies(currentPage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi xóa phim';
      setMoviesError(message);
    }
  };

  // ==================== Showtimes Functions ====================

  const fetchShowtimes = async (page: number) => {
    try {
      setShowtimesLoading(true);
      setShowtimesError(null);
      const response = await adminAPI.getShowtimes({
        search: searchShowtime,
        page,
        limit: 10,
      });
      setShowtimes(response.showtimes);
      setTotalPagesShowtime(response.totalPages);
      setCurrentPageShowtime(page);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi tải danh sách suất chiếu';
      setShowtimesError(message);
      console.error('Showtimes fetch error:', error);
    } finally {
      setShowtimesLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await adminAPI.getRooms();
      setRooms(response);
    } catch (error) {
      console.error('Rooms fetch error:', error);
    }
  };

  const fetchMoviesDropdown = async () => {
    try {
      const response = await adminAPI.getMoviesDropdown();
      setMoviesDropdown(response);
    } catch (error) {
      console.error('Movies dropdown fetch error:', error);
    }
  };

  const handleAddShowtime = () => {
    setEditingShowtime(null);
    setShowShowtimeModal(true);
  };

  const handleEditShowtime = (showtime: Showtime) => {
    setEditingShowtime(showtime);
    setShowShowtimeModal(true);
  };

  const handleSaveShowtime = async (formData: Partial<Showtime>) => {
    try {
      if (editingShowtime) {
        await adminAPI.updateShowtime(editingShowtime.masuat, formData);
      } else {
        await adminAPI.createShowtime(formData);
      }
      setShowtimesError(null);
      setShowShowtimeModal(false);
      fetchShowtimes(1);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi lưu suất chiếu';
      setShowtimesError(message);
    }
  };

  const handleDeleteShowtime = async (masuat: string) => {
    if (!confirm(`Xác nhận xóa suất chiếu?`)) return;
    try {
      await adminAPI.deleteShowtime(masuat);
      setShowtimesError(null);
      fetchShowtimes(currentPageShowtime);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi xóa suất chiếu';
      setShowtimesError(message);
    }
  };

  // ==================== Vouchers Functions ====================

  const fetchVouchers = async (page: number) => {
    try {
      setVouchersLoading(true);
      setVouchersError(null);
      const response = await adminAPI.getVouchers({
        search: searchVoucher,
        page,
        limit: 10,
      });
      setVouchers(response.vouchers);
      setTotalPagesVoucher(response.totalPages);
      setCurrentPageVoucher(page);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi tải danh sách voucher';
      setVouchersError(message);
      console.error('Vouchers fetch error:', error);
    } finally {
      setVouchersLoading(false);
    }
  };

  const handleAddVoucher = () => {
    setEditingVoucher(null);
    setShowVoucherModal(true);
  };

  const handleEditVoucher = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setShowVoucherModal(true);
  };

  const handleSaveVoucher = async (formData: Partial<Voucher>) => {
    try {
      if (editingVoucher) {
        await adminAPI.updateVoucher(editingVoucher.makhuyenmai, formData);
      } else {
        await adminAPI.createVoucher(formData);
      }
      setVouchersError(null);
      setShowVoucherModal(false);
      fetchVouchers(1);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi lưu voucher';
      setVouchersError(message);
    }
  };

  const handleDeleteVoucher = async (makhuyenmai: string) => {
    if (!confirm(`Xác nhận xóa voucher?`)) return;
    try {
      await adminAPI.deleteVoucher(makhuyenmai);
      setVouchersError(null);
      fetchVouchers(currentPageVoucher);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi xóa voucher';
      setVouchersError(message);
    }
  };

  const tabs = [
    { id: 'stats' as TabType, label: 'Thống kê', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'movies' as TabType, label: 'Quản lý Phim', icon: <Film className="w-4 h-4" /> },
    { id: 'schedule' as TabType, label: 'Lên lịch chiếu', icon: <Calendar className="w-4 h-4" /> },
    { id: 'voucher' as TabType, label: 'Voucher', icon: <Tag className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Admin Top Navbar */}
      <header className="h-14 bg-[#0D0D0D] border-b border-[#2A2A2A] flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#E50914] rounded-lg flex items-center justify-center">
            <Film className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-black tracking-widest text-base">CINEMOON</span>
          <div className="w-px h-5 bg-[#2A2A2A] mx-2" />
          <span className="text-gray-400 text-sm flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#E50914] rounded-full animate-pulse" />
            Admin Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-sm">Quản trị viên: <span className="text-white">Admin#001</span></span>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-[#E50914] text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-[#0D0D0D] border-b border-[#2A2A2A] px-8">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#E50914] text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {/* TAB: Statistics */}
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-white mb-6" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Tổng quan hệ thống</h2>

            {/* Loading State */}
            {statsLoading && (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-[#2A2A2A] border-t-[#E50914] rounded-full animate-spin" />
                </div>
                <p className="text-gray-400 mt-4">Đang tải dữ liệu...</p>
              </div>
            )}

            {/* Error State */}
            {statsError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <p className="text-red-400 text-sm">{statsError}</p>
              </div>
            )}

            {/* Dashboard Content */}
            {!statsLoading && !statsError && dashboardData && (
              <>
                {/* TIER 1: KPI Cards - Annual Metrics (Year-to-Date) */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    {
                      title: 'Tổng doanh thu năm',
                      value: formatCurrencyVND(dashboardData.kpi.revenue),
                      icon: <TrendingUp className="w-6 h-6 text-green-400" />,
                      color: 'text-green-400',
                      bg: 'bg-green-400/10 border-green-400/20',
                    },
                    {
                      title: 'Tổng vé bán ra năm',
                      value: dashboardData.kpi.totalTickets.toLocaleString('vi-VN'),
                      sub: 'vé',
                      icon: <Ticket className="w-6 h-6 text-[#E50914]" />,
                      color: 'text-[#E50914]',
                      bg: 'bg-[#E50914]/10 border-[#E50914]/20',
                    },
                    {
                      title: 'Số khách hàng mới năm',
                      value: dashboardData.kpi.newCustomers.toLocaleString('vi-VN'),
                      sub: 'khách',
                      icon: <Users className="w-6 h-6 text-[#F5C518]" />,
                      color: 'text-[#F5C518]',
                      bg: 'bg-[#F5C518]/10 border-[#F5C518]/20',
                    },
                  ].map(({ title, value, sub, icon, color, bg }) => (
                    <div key={title} className={`bg-[#1A1A1A] border rounded-xl p-6 ${bg}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <p className="text-gray-500 text-xs leading-relaxed">{title}</p>
                          <p className="text-gray-600 text-xs mt-1">Năm 2026</p>
                        </div>
                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                          {icon}
                        </div>
                      </div>
                      <p className={`${color} font-bold text-2xl`}>{value}</p>
                      {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
                    </div>
                  ))}
                </div>

                {/* TIER 2: Charts - Line Chart (Left) + Bar Chart (Right) */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Left: Monthly Revenue Line Chart */}
                  <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-white font-semibold">Biến động Tổng Doanh Thu 12 Tháng</h3>
                        <p className="text-gray-500 text-xs mt-0.5">Đơn vị: tỷ đồng</p>
                      </div>
                    </div>
                    <div style={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardData.monthlyRevenue}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                          <XAxis
                            dataKey="month"
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(month) => `Th.${month}`}
                          />
                          <YAxis
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => (value / 1_000_000_000).toFixed(1)}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1A1A1A',
                              border: '1px solid #2A2A2A',
                              borderRadius: '8px',
                            }}
                            formatter={(value) => [formatCurrency(value as number), 'Doanh Thu']}
                            labelFormatter={(label) => `Tháng ${label}`}
                          />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#E50914"
                            strokeWidth={3}
                            dot={{ fill: '#E50914', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right: Top 5 Movies Vertical Bar Chart */}
                  <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-white font-semibold">Top 5 Phim theo doanh thu</h3>
                        <p className="text-gray-500 text-xs mt-0.5">Đơn vị: triệu đồng</p>
                      </div>
                    </div>
                    <div style={{ height: 280 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={dashboardData.topMovies.map((m) => ({
                            name: m.tenphim.length > 12 ? m.tenphim.slice(0, 12) + '…' : m.tenphim,
                            fullName: m.tenphim,
                            revenue: Math.round(m.doanhthu / 1_000_000),
                            tickets: m.tongVe,
                          }))}
                          margin={{ top: 8, right: 8, left: 0, bottom: 40 }}
                          barSize={36}
                        >
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F5C518" stopOpacity={1} />
                              <stop offset="100%" stopColor="#E50914" stopOpacity={0.9} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" horizontal={true} vertical={false} />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#9CA3AF', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            interval={0}
                            angle={-20}
                            textAnchor="end"
                            dy={8}
                          />
                          <YAxis
                            tick={{ fill: '#6B7280', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `${v}tr`}
                          />
                          <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                            content={({ payload }) => {
                              if (!payload?.length) return null;
                              const d = payload[0].payload;
                              return (
                                <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
                                  <p style={{ color: '#9CA3AF', marginBottom: 6 }}>{d.fullName}</p>
                                  <p style={{ color: '#F5C518', fontWeight: 600 }}>{d.revenue} triệu đồng</p>
                                  <p style={{ color: '#6B7280', marginTop: 2 }}>{d.tickets?.toLocaleString('vi-VN')} vé</p>
                                </div>
                              );
                            }}
                          />
                          <Bar dataKey="revenue" fill="url(#barGradient)" radius={[6, 6, 0, 0]}>
                            {dashboardData.topMovies.map((_, idx) => (
                              <Cell
                                key={idx}
                                fill={idx === 0 ? 'url(#barGradient)' : idx === 1 ? '#E50914CC' : '#E5091466'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* TIER 3: Tables - Top Customers (Left) + Occupancy Rate (Right) */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Left: Top Customers */}
                  <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Top 5 Khách hàng</h3>
                    <div className="space-y-2">
                      {dashboardData.topCustomers.map((customer, idx) => (
                        <div key={customer.makh} className="flex items-center justify-between p-3 bg-[#252525] rounded-lg hover:bg-[#2A2A2A] transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              idx === 0 ? 'bg-[#F5C518] text-black' : idx === 1 ? 'bg-[#E50914] text-white' : 'bg-gray-600 text-white'
                            }`}>
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{customer.hoten}</p>
                              <p className="text-gray-500 text-xs">{customer.soGiaoDich} lần mua</p>
                            </div>
                          </div>
                          <p className="text-[#F5C518] font-semibold text-sm flex-shrink-0">{formatCurrencyVND(customer.tongChiTieu)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Occupancy Rate */}
                  <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-4">Tỷ lệ lấp đầy suất chiếu hôm nay</h3>
                    {dashboardData.occupancyRate.length === 0 ? (
                      <p className="text-gray-500 text-sm py-8 text-center">Không có suất chiếu nào hôm nay</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[#2A2A2A]">
                              {['Giờ', 'Phim', 'Phòng', 'Tỷ lệ', 'Vé'].map(h => (
                                <th key={h} className="text-left px-2 py-2 text-gray-500 text-xs font-medium">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.occupancyRate.map((showtime, idx) => (
                              <tr key={showtime.masuat} className={`border-b border-[#2A2A2A] ${
                                idx % 2 === 1 ? 'bg-[#1C1C1C]' : ''
                              }`}>
                                <td className="px-2 py-2">
                                  <span className="text-white text-xs font-medium">{showtime.giobatdau}</span>
                                </td>
                                <td className="px-2 py-2">
                                  <span className="text-gray-300 text-xs truncate block">{showtime.tenphim}</span>
                                </td>
                                <td className="px-2 py-2">
                                  <span className="text-gray-400 text-xs">{showtime.maphong}</span>
                                </td>
                                <td className="px-2 py-2">
                                  <div className="flex items-center gap-1">
                                    <div className="w-12 bg-[#252525] rounded-full h-1">
                                      <div
                                        className={`h-full rounded-full transition-all ${
                                          showtime.tyLeLapDay >= 80
                                            ? 'bg-[#E50914]'
                                            : showtime.tyLeLapDay >= 50
                                            ? 'bg-[#F5C518]'
                                            : 'bg-green-500'
                                        }`}
                                        style={{ width: `${showtime.tyLeLapDay}%` }}
                                      />
                                    </div>
                                    <span className="text-white text-xs font-medium w-8 text-right">{showtime.tyLeLapDay}%</span>
                                  </div>
                                </td>
                                <td className="px-2 py-2 text-right">
                                  <span className="text-gray-400 text-xs">
                                    {showtime.soVeBan}/{showtime.succhuaghe}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: Movies Management */}
        {activeTab === 'movies' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <h2 className="text-white" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Quản lý phim
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-2.5 gap-2 w-64">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm phim..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent text-sm text-gray-300 outline-none w-full placeholder-gray-600"
                  />
                </div>
                <button
                  onClick={handleAddMovie}
                  className="flex items-center gap-2 bg-[#E50914] hover:bg-[#C40812] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Phim Mới
                </button>
              </div>
            </div>

            {/* Error Message */}
            {moviesError && (
              <div className="bg-[#E50914]/10 border border-[#E50914]/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#E50914] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#E50914] text-sm font-medium">Lỗi</p>
                  <p className="text-red-300 text-sm">{moviesError}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {moviesLoading && (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-[#2A2A2A] border-t-[#E50914] rounded-full animate-spin" />
                </div>
                <p className="text-gray-400 mt-4">Đang tải dữ liệu phim...</p>
              </div>
            )}

            {/* Movies Table */}
            {!moviesLoading && movies.length > 0 && (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#161616] border-b border-[#2A2A2A]">
                      {['Phim', 'Thời lượng', 'Đạo diễn', 'Thể loại', 'Suất chiếu', 'Doanh thu tháng', 'Thao tác'].map(
                        (header) => (
                          <th
                            key={header}
                            className="px-5 py-3.5 text-left text-gray-500 text-xs font-medium uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map((movie, idx) => (
                      <tr
                        key={movie.maphim}
                        className={`border-b border-[#222] hover:bg-white/2 transition-colors ${
                          idx % 2 === 1 ? 'bg-[#1C1C1C]' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {movie.poster && (
                              <img
                                src={movie.poster}
                                alt={movie.tenphim}
                                className="w-10 h-14 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <p className="text-white text-sm font-medium truncate">{movie.tenphim}</p>
                              <p className="text-gray-600 text-xs truncate">{movie.maphim}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-sm">{movie.thoigianphim} phút</td>
                        <td className="px-5 py-3.5 text-gray-400 text-sm">{movie.directorName || '—'}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-sm">{movie.daiPhim || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className="bg-[#252525] text-[#F5C518] px-3 py-1 rounded-full text-xs font-medium">
                            {movie.soSuatChieu || 0}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#10B981] text-sm font-medium">
                          {formatCurrency(movie.doanhThuThang || 0)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditMovie(movie)}
                              className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteMovie(movie.maphim, movie.tenphim)}
                              className="w-8 h-8 bg-[#E50914]/10 border border-[#E50914]/20 rounded-lg flex items-center justify-center hover:bg-[#E50914]/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#E50914]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 p-6 border-t border-[#2A2A2A]">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => fetchMovies(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-[#E50914] text-white'
                            : 'bg-[#252525] text-gray-400 hover:bg-[#2A2A2A]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!moviesLoading && movies.length === 0 && !moviesError && (
              <div className="text-center py-12">
                <Film className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-4">
                  {searchTerm ? 'Không tìm thấy phim nào' : 'Chưa có phim nào'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={handleAddMovie}
                    className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#C40812] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Phim Đầu Tiên
                  </button>
                )}
              </div>
            )}

            {/* Movie Form Modal */}
            {showMovieModal && (
              <MovieFormModal
                movie={editingMovie}
                genres={genres}
                onSave={handleSaveMovie}
                onClose={() => setShowMovieModal(false)}
              />
            )}
          </div>
        )}

        {/* TAB: Schedule */}
        {activeTab === 'schedule' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Lên lịch chiếu</h2>
              <button
                onClick={handleAddShowtime}
                className="flex items-center gap-2 bg-[#E50914] hover:bg-[#C40812] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                Thêm Suất chiếu
              </button>
            </div>

            {/* Search */}
            <div className="mb-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Tìm suất chiếu..."
                  value={searchShowtime}
                  onChange={(e) => setSearchShowtime(e.target.value)}
                  className="w-full bg-[#252525] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#E50914]"
                />
              </div>
            </div>

            {/* Loading State */}
            {showtimesLoading && (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-[#2A2A2A] border-t-[#E50914] rounded-full animate-spin" />
                </div>
                <p className="text-gray-400 mt-4">Đang tải dữ liệu...</p>
              </div>
            )}

            {/* Error State */}
            {showtimesError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {showtimesError}
                </p>
              </div>
            )}

            {/* Table */}
            {!showtimesLoading && showtimes.length > 0 && (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#0D0D0D] border-b border-[#2A2A2A]">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-gray-400 font-semibold">Phim</th>
                      <th className="px-5 py-3.5 text-left text-gray-400 font-semibold">Phòng</th>
                      <th className="px-5 py-3.5 text-left text-gray-400 font-semibold">Ngày</th>
                      <th className="px-5 py-3.5 text-left text-gray-400 font-semibold">Giờ</th>
                      <th className="px-5 py-3.5 text-left text-gray-400 font-semibold">Lấp đầy</th>
                      <th className="px-5 py-3.5 text-left text-gray-400 font-semibold">Trạng thái</th>
                      <th className="px-5 py-3.5 text-left text-gray-400 font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showtimes.map((showtime) => (
                      <tr key={showtime.masuat} className="border-b border-[#2A2A2A] hover:bg-[#0D0D0D]/50 transition-colors">
                        <td className="px-5 py-3.5 text-white text-sm font-medium">{showtime.tenphim}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-sm">{showtime.maphong}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-sm">{showtime.ngaychieu}</td>
                        <td className="px-5 py-3.5 text-gray-400 text-sm">{showtime.giobatdau} - {showtime.gioketthuc}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-[#252525] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#E50914] rounded-full"
                                style={{ width: `${showtime.tyLeLapDay}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{showtime.tyLeLapDay}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {showtime.trangthaisuat}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditShowtime(showtime)}
                              className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteShowtime(showtime.masuat)}
                              className="w-8 h-8 bg-[#E50914]/10 border border-[#E50914]/20 rounded-lg flex items-center justify-center hover:bg-[#E50914]/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#E50914]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPagesShowtime > 1 && (
                  <div className="flex justify-center gap-2 p-6 border-t border-[#2A2A2A]">
                    {Array.from({ length: totalPagesShowtime }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => fetchShowtimes(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          currentPageShowtime === page
                            ? 'bg-[#E50914] text-white'
                            : 'bg-[#252525] text-gray-400 hover:bg-[#2A2A2A]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!showtimesLoading && showtimes.length === 0 && !showtimesError && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-4">
                  {searchShowtime ? 'Không tìm thấy suất chiếu nào' : 'Chưa có suất chiếu nào'}
                </p>
                {!searchShowtime && (
                  <button
                    onClick={handleAddShowtime}
                    className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#C40812] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Suất chiếu Đầu Tiên
                  </button>
                )}
              </div>
            )}

            {/* Showtime Form Modal */}
            {showShowtimeModal && (
              <ShowtimeFormModal
                showtime={editingShowtime}
                rooms={rooms}
                movies={moviesDropdown}
                onSave={handleSaveShowtime}
                onClose={() => setShowShowtimeModal(false)}
              />
            )}
          </div>
        )}

        {/* TAB: Voucher */}
        {activeTab === 'voucher' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Quản lý Voucher</h2>
              <button
                onClick={handleAddVoucher}
                className="flex items-center gap-2 bg-[#E50914] hover:bg-[#C40812] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                Tạo Voucher mới
              </button>
            </div>

            {/* Search */}
            <div className="mb-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="Tìm voucher..."
                  value={searchVoucher}
                  onChange={(e) => setSearchVoucher(e.target.value)}
                  className="w-full bg-[#252525] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#E50914]"
                />
              </div>
            </div>

            {/* Loading State */}
            {vouchersLoading && (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-[#2A2A2A] border-t-[#E50914] rounded-full animate-spin" />
                </div>
                <p className="text-gray-400 mt-4">Đang tải dữ liệu...</p>
              </div>
            )}

            {/* Error State */}
            {vouchersError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {vouchersError}
                </p>
              </div>
            )}

            {/* Vouchers Grid */}
            {!vouchersLoading && vouchers.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {vouchers.map((voucher) => (
                    <div key={voucher.makhuyenmai} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[#F5C518] font-mono font-bold">{voucher.makhuyenmai}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            Hết hạn: {new Date(voucher.ngayketthuc).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                          voucher.trangThai === 'Active'
                            ? 'bg-green-400/10 border-green-400/30 text-green-400'
                            : voucher.trangThai === 'Upcoming'
                            ? 'bg-blue-400/10 border-blue-400/30 text-blue-400'
                            : 'bg-gray-500/10 border-gray-500/30 text-gray-500'
                        }`}>
                          {voucher.trangThai === 'Active' ? 'Đang hoạt động' : voucher.trangThai === 'Upcoming' ? 'Sắp tới' : 'Hết hạn'}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="text-white text-sm mb-2">{voucher.tenchuongtrinh}</p>
                        <p className="text-gray-400 text-xs mb-3">{voucher.dieukienapdung}</p>
                        <p className="text-[#E50914] font-bold text-lg mb-2">-{formatCurrency(voucher.giatrigiam)}</p>
                        {voucher.soLanSuDung !== undefined && (
                          <p className="text-gray-500 text-xs">Đã dùng: {voucher.soLanSuDung} lần</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditVoucher(voucher)}
                          className="flex-1 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleDeleteVoucher(voucher.makhuyenmai)}
                          className="flex-1 py-2 bg-[#E50914]/10 border border-[#E50914]/20 text-[#E50914] rounded-lg text-xs hover:bg-[#E50914]/20 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPagesVoucher > 1 && (
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPagesVoucher }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => fetchVouchers(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          currentPageVoucher === page
                            ? 'bg-[#E50914] text-white'
                            : 'bg-[#252525] text-gray-400 hover:bg-[#2A2A2A]'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!vouchersLoading && vouchers.length === 0 && !vouchersError && (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-4">
                  {searchVoucher ? 'Không tìm thấy voucher nào' : 'Chưa có voucher nào'}
                </p>
                {!searchVoucher && (
                  <button
                    onClick={handleAddVoucher}
                    className="inline-flex items-center gap-2 bg-[#E50914] hover:bg-[#C40812] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Tạo Voucher Đầu Tiên
                  </button>
                )}
              </div>
            )}

            {/* Voucher Form Modal */}
            {showVoucherModal && (
              <VoucherFormModal
                voucher={editingVoucher}
                onSave={handleSaveVoucher}
                onClose={() => setShowVoucherModal(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};