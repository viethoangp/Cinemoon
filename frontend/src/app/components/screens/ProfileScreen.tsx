import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft,
  LogOut,
  User,
  Mail,
  Star,
  Film,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  DollarSign,
  Loader,
  AlertCircle,
  Edit2,
  QrCode,
} from 'lucide-react';
import { authAPI } from '../../../services/api';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

interface UserProfile {
  MATK?: string;
  TENDANGNHAP?: string;
  HOTEN?: string;
  EMAIL?: string;
  DIACHI?: string;
  SODIENTHOAI?: string;
  DIEMTICHLU?: number;
  QUYENTRUYCAP?: string;
  NGAYTAOTK?: string;
}

interface Ticket {
  MAVE?: string;
  TENPHIM: string;
  TENRAP: string;
  PHONG: string;
  NGAYCHIEU: string;
  GIOBATDAU: string;
  DANHSACHGHENGOI: string;
  TONGTIEN: number;
  PHUONGTHUCTHANHTOAN: string;
  THOIGIAN?: string;
  TRANGTHAIVE?: string;
}

interface BookingHistory {
  tickets: Ticket[];
  totalSpent?: number;
  totalTickets?: number;
}

const formatDateDisplay = (iso: string) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN');
  } catch {
    return iso;
  }
};

const formatTimeDisplay = (time: string) => {
  if (!time) return '-';
  if (time.includes(':')) return time.substring(0, 5); // HH:MM
  return time;
};

const formatCurrency = (amount: number | undefined) => {
  if (!amount) return '0đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const SkeletonLoader = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-32 bg-slate-700 rounded-lg"></div>
    <div className="h-96 bg-slate-700 rounded-lg"></div>
  </div>
);

export const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useApp();

  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookingHistory, setBookingHistory] = useState<BookingHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile and booking history
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await authAPI.getUserProfile();
        console.log('[ProfileScreen] Raw API response:', response);

        // 1. BÓC LỚP VỎ 'data': Xử lý cả trường hợp API có bọc data hoặc không bọc
        const apiData = response.data ? response.data : response;

        // 2. Lấy thông tin user (Hỗ trợ cả trường hợp bọc trong object 'user' hoặc nằm phẳng)
        const userData = apiData.user ? apiData.user : apiData;

        // Extract user profile
        const userProfile: UserProfile = {
          MATK: userData.MATK || userData.matk,
          TENDANGNHAP: userData.TENDANGNHAP || userData.tendangnhap || userData.username,
          HOTEN: userData.HOTEN || userData.hoten || userData.fullName,
          EMAIL: userData.EMAIL || userData.email,
          DIACHI: userData.DIACHI || userData.diachi || userData.address,
          // Bổ sung thêm SDT và DIEMTICHLUY để khớp tuyệt đối với Backend Oracle
          SODIENTHOAI: userData.SODIENTHOAI || userData.sodienthoai || userData.phone || userData.SDT,
          DIEMTICHLU: userData.DIEMTICHLUY || userData.DIEMTICHLU || userData.diemtichlu || 0,
          QUYENTRUYCAP: userData.QUYENTRUYCAP || userData.quyentruycap || 'User',
          NGAYTAOTK: userData.NGAYTAOTK || userData.ngaytaotk,
        };

        // 3. Extract booking history một cách chính xác
        const ticketsList = apiData.tickets || (apiData.data && apiData.data.tickets) || [];

        const bookingData: BookingHistory = {
          tickets: Array.isArray(ticketsList) ? ticketsList : [],
          totalSpent: apiData.totalSpent,
          totalTickets: apiData.totalTickets,
        };

        setProfile(userProfile);
        setBookingHistory(bookingData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải thông tin tài khoản';
        setError(message);
        console.error('[ProfileScreen] Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleEditProfile = () => {
    // TODO: Implement edit profile modal/screen
    alert('Chỉnh sửa hồ sơ sẽ được phát triển trong phiên bản tiếp theo');
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition"
          >
            <ChevronLeft size={20} />
            <span>Quay lại</span>
          </button>
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ChevronLeft size={20} />
            <span>Quay lại</span>
          </button>
          <h1 className="text-3xl font-bold text-white">Hồ sơ cá nhân</h1>
          <div className="w-12"></div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* User Profile Card */}
        <Card className="mb-8 border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-8 shadow-xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center text-center md:text-left md:items-start space-y-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <User size={48} className="text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-purple-400/50"></div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {profile?.HOTEN || profile?.TENDANGNHAP || 'Người dùng'}
                </h2>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-purple-400" />
                    <span>{profile?.EMAIL || 'Không có email'}</span>
                  </div>
                  {profile?.SODIENTHOAI && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon size={16} className="text-purple-400" />
                      <span>{profile.SODIENTHOAI}</span>
                    </div>
                  )}
                  {profile?.DIACHI && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-purple-400" />
                      <span>{profile.DIACHI}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex flex-col justify-between">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Points */}
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/70 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={18} className="text-yellow-400" />
                    <span className="text-xs font-semibold text-slate-300 uppercase">Điểm tích lũy</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">
                    {profile?.DIEMTICHLU?.toLocaleString('vi-VN') || 0}
                  </p>
                </div>

                {/* Total Tickets */}
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/70 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <Ticket size={18} className="text-blue-400" />
                    <span className="text-xs font-semibold text-slate-300 uppercase">Tổng vé</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">
                    {bookingHistory?.totalTickets || bookingHistory?.tickets?.length || 0}
                  </p>
                </div>

                {/* Total Spent */}
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:bg-slate-700/70 transition md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={18} className="text-green-400" />
                    <span className="text-xs font-semibold text-slate-300 uppercase">Tổng chi tiêu</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400">
                    {bookingHistory?.totalSpent
                      ? formatCurrency(bookingHistory.totalSpent)
                      : bookingHistory?.tickets
                      ? formatCurrency(
                          bookingHistory.tickets.reduce((sum, ticket) => sum + (ticket.TONGTIEN || 0), 0)
                        )
                      : '0đ'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleEditProfile}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <Edit2 size={16} />
                  <span>Chỉnh sửa</span>
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="flex-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/50"
                >
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Booking History Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Film size={24} className="text-purple-400" />
            Lịch sử đặt vé
          </h2>

          {!bookingHistory?.tickets || bookingHistory.tickets.length === 0 ? (
            <Card className="border-slate-700 bg-slate-800/50 p-12 text-center">
              <Ticket size={48} className="mx-auto mb-4 text-slate-500" />
              <p className="text-slate-400 mb-2">Chưa có vé nào</p>
              <p className="text-sm text-slate-500">
                Bắt đầu đặt vé để xem những bộ phim yêu thích của bạn
              </p>
              <Button
                onClick={() => navigate('/home')}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                <Film size={16} />
                <span>Đặt vé ngay</span>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookingHistory.tickets.map((ticket, index) => (
                <Card
                  key={index}
                  className="border-slate-700 bg-gradient-to-r from-slate-800 to-slate-800/50 hover:from-slate-800/80 hover:to-slate-800/30 p-6 shadow-lg transition transform hover:scale-[1.01]"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left: Movie & Basic Info */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        {/* Ticket Icon */}
                        <div className="mt-1">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                            <Ticket size={24} className="text-white" />
                          </div>
                        </div>

                        {/* Movie Title & Cinema */}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white leading-tight">
                            {ticket.TENPHIM}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-slate-300 mt-2">
                            <MapPin size={14} className="text-slate-400" />
                            <span>{ticket.TENRAP}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-300">
                            <Users size={14} className="text-slate-400" />
                            <span>Phòng {ticket.PHONG}</span>
                          </div>
                        </div>
                      </div>

                      {/* Seats */}
                      <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-slate-400 mb-1">GHẾ ĐÃ CHỌN</p>
                        <p className="text-sm font-semibold text-blue-400">
                          {ticket.DANHSACHGHENGOI || '-'}
                        </p>
                      </div>
                    </div>

                    {/* Right: Date, Time, Price */}
                    <div className="space-y-3">
                      {/* Date & Time Row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={14} className="text-slate-400" />
                            <p className="text-xs font-semibold text-slate-400 uppercase">Ngày</p>
                          </div>
                          <p className="text-sm font-semibold text-white">
                            {formatDateDisplay(ticket.NGAYCHIEU)}
                          </p>
                        </div>
                        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock size={14} className="text-slate-400" />
                            <p className="text-xs font-semibold text-slate-400 uppercase">Giờ</p>
                          </div>
                          <p className="text-sm font-semibold text-white">
                            {formatTimeDisplay(ticket.GIOBATDAU)}
                          </p>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-slate-400 mb-1">PHƯƠNG THỨC THANH TOÁN</p>
                        <p className="text-sm font-semibold text-emerald-400">
                          {ticket.PHUONGTHUCTHANHTOAN || 'Không xác định'}
                        </p>
                      </div>

                      {/* Total Price */}
                      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4">
                        <p className="text-xs font-semibold text-slate-300 mb-1">TỔNG TIỀN</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          {formatCurrency(ticket.TONGTIEN)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: QR Code Placeholder & Status */}
                  <div className="mt-4 pt-4 border-t border-slate-600/30 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      {ticket.THOIGIAN && (
                        <span>Đặt lúc: {new Date(ticket.THOIGIAN).toLocaleString('vi-VN')}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <QrCode size={14} />
                      <span className="text-slate-500">Mã vé: {ticket.MAVE || '#' + index}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Phone icon component (not in lucide-react by default)
const PhoneIcon = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);