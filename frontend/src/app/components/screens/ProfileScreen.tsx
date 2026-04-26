import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  User, Ticket, LogOut, Star, Clock, MapPin, ChevronRight,
  Edit3, Shield, Bell, CreditCard, Gift, TrendingUp
} from 'lucide-react';

const AVATAR_URL = "https://images.unsplash.com/photo-1764384700065-304c92b11e9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=80";

const formatCurrency = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const BOOKING_HISTORY = [
  { id: 'CM-2025-8421', date: '24/04/2025', movie: 'Rừng Thiêng', cinema: 'Cinemoon HN - Mipec', seats: 'D5, D6', showtime: '19:30', total: 220000, status: 'paid' },
  { id: 'CM-2025-7312', date: '20/04/2025', movie: 'Vũ Trụ Song Song', cinema: 'Cinemoon HN - Vincom', seats: 'E4, E5, E6', showtime: '21:00', total: 330000, status: 'paid' },
  { id: 'CM-2025-6548', date: '15/04/2025', movie: 'Ngọn Lửa Báo Thù', cinema: 'Cinemoon HCM - Bitexco', seats: 'B7', showtime: '19:00', total: 89250, status: 'pending' },
  { id: 'CM-2025-5901', date: '10/04/2025', movie: 'Bóng Tối Thành Phố', cinema: 'Cinemoon HN - Mipec', seats: 'C3, C4', showtime: '16:30', total: 178500, status: 'paid' },
  { id: 'CM-2025-4233', date: '05/04/2025', movie: 'Tình Yêu Vĩnh Cửu', cinema: 'Cinemoon HN - Royal City', seats: 'F8, F9', showtime: '20:00', total: 157500, status: 'cancelled' },
  { id: 'CM-2025-3102', date: '28/03/2025', movie: 'Bóng Ma Cuối Cùng', cinema: 'Cinemoon HCM - Landmark 81', seats: 'A10', showtime: '22:00', total: 84000, status: 'paid' },
];

type ActiveSection = 'profile' | 'history' | 'loyalty' | 'settings';

const STATUS_CONFIG = {
  paid: { label: 'Đã thanh toán', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  pending: { label: 'Đang chờ', color: 'text-[#F5C518] bg-[#F5C518]/10 border-[#F5C518]/30' },
  cancelled: { label: 'Đã hủy', color: 'text-gray-500 bg-gray-500/10 border-gray-500/30' },
};

export const ProfileScreen = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>('history');
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [bookings, setBookings] = useState(BOOKING_HISTORY);

  const handleCancel = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    setCancelTarget(null);
  };

  const sidebarItems = [
    { id: 'profile' as ActiveSection, label: 'Thông tin tài khoản', icon: <User className="w-4 h-4" /> },
    { id: 'history' as ActiveSection, label: 'Lịch sử mua vé', icon: <Ticket className="w-4 h-4" /> },
    { id: 'loyalty' as ActiveSection, label: 'Điểm tích lũy', icon: <Star className="w-4 h-4" /> },
    { id: 'settings' as ActiveSection, label: 'Cài đặt', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div style={{ height: '100%' }} className="bg-[#121212] flex overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-64 bg-[#0D0D0D] border-r border-[#2A2A2A] flex flex-col py-6">
        {/* User card */}
        <div className="px-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img src={AVATAR_URL} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-[#E50914]" />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#0D0D0D]" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Nguyễn Văn An</p>
              <p className="text-gray-500 text-xs">an.nguyen@email.com</p>
            </div>
          </div>

          {/* Loyalty card */}
          <div className="bg-gradient-to-r from-[#2A1F00] to-[#1A1400] border border-[#F5C518]/20 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-[#F5C518] fill-[#F5C518]" />
                <span className="text-[#F5C518] text-xs font-semibold">GOLD MEMBER</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#F5C518]/50" />
            </div>
            <div className="text-[#F5C518]" style={{ fontSize: '1.4rem', fontWeight: 800 }}>150</div>
            <p className="text-[#F5C518]/60 text-xs">điểm tích lũy</p>
            <div className="mt-2 h-1.5 bg-[#F5C518]/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#F5C518] rounded-full" style={{ width: '60%' }} />
            </div>
            <p className="text-[#F5C518]/40 text-[10px] mt-1">100 điểm để lên PLATINUM</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeSection === item.id
                  ? 'bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 mt-4 pt-4 border-t border-[#2A2A2A]">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-[#E50914] hover:bg-[#E50914]/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto">
        {/* Section: Profile */}
        {activeSection === 'profile' && (
          <div className="p-8">
            <h2 className="text-white mb-6" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Thông tin tài khoản</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Avatar section */}
              <div className="col-span-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6 flex items-center gap-6">
                <div className="relative">
                  <img src={AVATAR_URL} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-[#E50914]" />
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#E50914] rounded-full flex items-center justify-center border-2 border-[#1A1A1A]">
                    <Edit3 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">Nguyễn Văn An</h3>
                  <p className="text-gray-500 text-sm">Thành viên từ tháng 1, 2024</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-[#F5C518]/10 border border-[#F5C518]/30 text-[#F5C518] rounded-full">GOLD Member</span>
                    <span className="text-xs px-2 py-1 bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] rounded-full">Verified</span>
                  </div>
                </div>
              </div>

              {[
                { label: 'Họ và tên', value: 'Nguyễn Văn An' },
                { label: 'Email', value: 'an.nguyen@email.com' },
                { label: 'Số điện thoại', value: '0901 234 567' },
                { label: 'Ngày sinh', value: '15/06/1995' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
                  <label className="text-gray-500 text-xs mb-2 block">{label}</label>
                  <div className="flex items-center justify-between">
                    <span className="text-white">{value}</span>
                    <button className="text-[#E50914] hover:text-[#ff1a1a] transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Booking History */}
        {activeSection === 'history' && (
          <div className="p-8">
            {/* Header with stats */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Lịch sử mua vé</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="text-green-400 font-medium">{bookings.filter(b => b.status === 'paid').length} đã thanh toán</span>
                <span className="text-[#F5C518]">{bookings.filter(b => b.status === 'pending').length} đang chờ</span>
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A2A2A] bg-[#161616]">
                    {['Mã GD', 'Ngày mua', 'Tên phim', 'Rạp / Giờ chiếu', 'Ghế', 'Tổng tiền', 'Trạng thái', ''].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-gray-500 text-xs font-medium uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, idx) => {
                    const status = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG];
                    return (
                      <tr
                        key={booking.id}
                        className={`border-b border-[#222] hover:bg-white/2 transition-colors ${idx % 2 === 1 ? 'bg-[#1C1C1C]' : ''}`}
                      >
                        <td className="px-5 py-4 text-[#E50914] text-sm font-mono">{booking.id}</td>
                        <td className="px-5 py-4 text-gray-400 text-sm">{booking.date}</td>
                        <td className="px-5 py-4">
                          <span className="text-white text-sm font-medium">{booking.movie}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-gray-400 text-xs">
                            <div className="flex items-center gap-1 mb-0.5">
                              <MapPin className="w-3 h-3" />{booking.cinema}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />{booking.showtime}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-300 text-sm font-mono">{booking.seats}</td>
                        <td className="px-5 py-4 text-[#F5C518] text-sm font-semibold">{formatCurrency(booking.total)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => setCancelTarget(booking.id)}
                              className="text-[#E50914] hover:text-[#ff1a1a] text-xs font-medium underline transition-colors"
                            >
                              Hủy vé
                            </button>
                          )}
                          {booking.status === 'paid' && (
                            <button className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
                              Tải vé
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section: Loyalty */}
        {activeSection === 'loyalty' && (
          <div className="p-8">
            <h2 className="text-white mb-6" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Điểm tích lũy</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Điểm hiện tại', value: '150', icon: <Star className="w-5 h-5 text-[#F5C518]" />, color: 'text-[#F5C518]' },
                { label: 'Tổng điểm tích lũy', value: '420', icon: <TrendingUp className="w-5 h-5 text-green-400" />, color: 'text-green-400' },
                { label: 'Điểm đã dùng', value: '270', icon: <Gift className="w-5 h-5 text-[#E50914]" />, color: 'text-[#E50914]' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">{icon}<span className="text-gray-500 text-sm">{label}</span></div>
                  <p className={`${color} font-bold`} style={{ fontSize: '2rem' }}>{value}</p>
                  <p className="text-gray-600 text-xs">điểm</p>
                </div>
              ))}
            </div>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Quyền lợi thành viên GOLD</h3>
              <div className="space-y-3">
                {[
                  'Tích 1 điểm / 1.000đ thanh toán vé',
                  'Ưu tiên chọn ghế VIP',
                  'Giảm 10% phí dịch vụ',
                  'Nhận voucher sinh nhật đặc biệt',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#F5C518]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-3 h-3 text-[#F5C518] fill-[#F5C518]" />
                    </div>
                    <span className="text-gray-300 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section: Settings */}
        {activeSection === 'settings' && (
          <div className="p-8">
            <h2 className="text-white mb-6" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cài đặt</h2>
            <div className="space-y-4">
              {[
                { title: 'Thông báo email', desc: 'Nhận thông báo đặt vé và khuyến mãi qua email', icon: <Bell className="w-5 h-5 text-[#E50914]" />, enabled: true },
                { title: 'Bảo mật 2 lớp', desc: 'Xác thực đăng nhập qua số điện thoại', icon: <Shield className="w-5 h-5 text-[#E50914]" />, enabled: false },
                { title: 'Lưu phương thức thanh toán', desc: 'Ghi nhớ thông tin thanh toán cho lần sau', icon: <CreditCard className="w-5 h-5 text-[#E50914]" />, enabled: true },
              ].map(({ title, desc, icon, enabled }) => (
                <div key={title} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#E50914]/10 rounded-lg flex items-center justify-center">{icon}</div>
                    <div>
                      <p className="text-white font-medium text-sm">{title}</p>
                      <p className="text-gray-500 text-xs">{desc}</p>
                    </div>
                  </div>
                  {/* Toggle */}
                  <div className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${enabled ? 'bg-[#E50914]' : 'bg-[#333]'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full m-0.5 transition-transform shadow ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cancel confirmation dialog */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setCancelTarget(null)} />
          <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-white font-bold mb-2">Xác nhận hủy vé</h3>
            <p className="text-gray-400 text-sm mb-6">Bạn có chắc chắn muốn hủy vé <span className="text-white font-mono">{cancelTarget}</span>? Thao tác này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => setCancelTarget(null)} className="flex-1 py-2.5 bg-[#252525] border border-[#333] text-gray-300 rounded-xl text-sm hover:bg-[#2A2A2A] transition-colors">
                Giữ lại
              </button>
              <button onClick={() => handleCancel(cancelTarget)} className="flex-1 py-2.5 bg-[#E50914] text-white rounded-xl text-sm hover:bg-[#C40812] transition-colors">
                Hủy vé
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};