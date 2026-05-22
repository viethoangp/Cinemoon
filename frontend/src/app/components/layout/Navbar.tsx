import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Film, Bell, ChevronDown } from 'lucide-react';
import { authAPI } from '../../../services/api';
import { useApp } from '../../context/AppContext';

const AVATAR_URL = "https://images.unsplash.com/photo-1764384700065-304c92b11e9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=80";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, removeNotification } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userName, setUserName] = useState<string>('User');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await authAPI.getUserProfile();
        console.log('[Navbar] API response:', response);
        if (response && response.HOTEN) {
          setUserName(response.HOTEN);
          setUserEmail(response.EMAIL || response.TENDANGNHAP || '');
        } else if (response) {
          // Fallback if HOTEN not in response
          setUserName(response.TENDANGNHAP || 'User');
          setUserEmail(response.EMAIL || '');
        }
      } catch (error) {
        console.error('[Navbar] Error fetching user info:', error);
        setUserName('User');
        setUserEmail('');
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  const navLinks = [
    { label: 'Trang chủ', path: '/home' },
    { label: 'Lịch chiếu', path: '/showtime' },
    { label: 'Khuyến mãi', path: '/promotions' },
  ];

  return (
    <nav className="h-16 bg-[#0D0D0D] border-b border-[#2A2A2A] flex items-center justify-between px-8 flex-shrink-0 z-50">
      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => navigate('/home')}
      >
        <div className="w-8 h-8 bg-[#E50914] rounded-lg flex items-center justify-center shadow-lg shadow-red-900/50">
          <Film className="w-4 h-4 text-white" />
        </div>
        <span className="text-white text-lg font-black tracking-widest">CINEMOON</span>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navLinks.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              location.pathname === item.path
                ? 'text-[#E50914] bg-[#E50914]/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex-1"></div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E50914] rounded-full animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-[#2A2A2A]">
                <p className="text-white font-semibold">Thông báo</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-[#2A2A2A] last:border-b-0 flex items-start justify-between gap-3 ${
                        notif.type === 'success'
                          ? 'bg-green-500/10'
                          : notif.type === 'error'
                          ? 'bg-red-500/10'
                          : 'bg-blue-500/10'
                      }`}
                    >
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            notif.type === 'success'
                              ? 'text-green-400'
                              : notif.type === 'error'
                              ? 'text-red-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {notif.message}
                        </p>
                      </div>
                      <button
                        onClick={() => removeNotification(notif.id)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Không có thông báo
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <img
              src={AVATAR_URL}
              alt="User"
              className="w-8 h-8 rounded-full object-cover border-2 border-[#E50914]"
            />
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-3 border-b border-[#2A2A2A]">
                <p className="text-white text-sm font-medium">{userName}</p>
                <p className="text-gray-500 text-xs">{userEmail}</p>
              </div>
              <button
                onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-gray-300 text-sm hover:bg-white/5 hover:text-white transition-colors"
              >
                Hồ sơ cá nhân
              </button>
              <button
                onClick={() => { navigate('/admin'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-gray-300 text-sm hover:bg-white/5 hover:text-white transition-colors"
              >
                Quản trị viên
              </button>
              <button
                onClick={() => { navigate('/'); setShowDropdown(false); }}
                className="w-full text-left px-4 py-2.5 text-[#E50914] text-sm hover:bg-[#E50914]/10 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
