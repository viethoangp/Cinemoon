import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Film, Star, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const HERO_URL = "https://images.unsplash.com/photo-1759230766134-e3ff1c27d20e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    // Validation
    if (!form.username.trim()) {
      setLocalError('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!form.password.trim()) {
      setLocalError('Vui lòng nhập mật khẩu');
      return;
    }
    
    if (isRegister) {
      // Register validation
      if (!form.email.trim()) {
        setLocalError('Vui lòng nhập email');
        return;
      }
      if (form.password !== form.confirm) {
        setLocalError('Mật khẩu xác nhận không khớp');
        return;
      }
      // TODO: Implement register API call
      setLocalError('Chức năng đăng ký sẽ được cập nhật trong phase tới');
      return;
    }
    
    try {
      await login(form.username, form.password);
      // Navigate to home on successful login
      navigate('/home');
    } catch (err) {
      // Error is already set in AppContext
    }
  };

  return (
    <div className="w-full h-screen flex bg-[#121212]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* LEFT HERO SECTION — 50% */}
      <div className="w-1/2 relative overflow-hidden">
        {/* Background image */}
        <img
          src={HERO_URL}
          alt="Cinema"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E50914] rounded-xl flex items-center justify-center shadow-lg shadow-red-900/50">
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl font-black tracking-widest">CINEMOON</span>
          </div>

          {/* Center badge */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-[#F5C518] fill-[#F5C518]" />
                ))}
              </div>
              <span className="text-gray-300 text-sm ml-1">Trải nghiệm điện ảnh đỉnh cao</span>
            </div>
            <h1 className="text-white" style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.15 }}>
              Trải nghiệm<br />
              <span className="text-[#E50914]">điện ảnh</span><br />
              đỉnh cao
            </h1>
            <p className="text-gray-400 text-base leading-relaxed max-w-sm">
              Đặt vé xem phim trực tuyến dễ dàng, nhanh chóng và tiện lợi. Hàng trăm bộ phim hấp dẫn đang chờ bạn.
            </p>

            {/* Feature pills */}
            <div className="flex gap-3 flex-wrap">
              {['4K Ultra HD', 'Dolby Atmos', 'VIP Seats', 'E-Ticket'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom now-playing */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
            <div className="w-10 h-10 bg-[#E50914] rounded-full flex items-center justify-center flex-shrink-0">
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Đang chiếu hôm nay</p>
              <p className="text-gray-400 text-xs">18 bộ phim tại 6 cụm rạp toàn quốc</p>
            </div>
            <div className="ml-auto">
              <span className="text-[#F5C518] text-sm font-bold">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT FORM SECTION — 50% */}
      <div className="w-1/2 flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          {/* Tab switch */}
          <div className="flex bg-[#1C1C1C] rounded-xl p-1 mb-8">
            <button
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                !isRegister ? 'bg-[#E50914] text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isRegister ? 'bg-[#E50914] text-white shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              Đăng ký
            </button>
          </div>

          <h2 className="text-white mb-1" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {isRegister ? 'Tạo tài khoản mới' : 'Chào mừng trở lại!'}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {isRegister
              ? 'Tham gia Cinemoon để trải nghiệm điện ảnh đỉnh cao'
              : 'Đăng nhập để đặt vé và quản lý tài khoản của bạn'}
          </p>
          
          {/* Error message */}
          {(localError || authError) && (
            <div className="mb-6 p-4 bg-[#E50914]/20 border border-[#E50914] rounded-lg">
              <p className="text-[#ff6b6b] text-sm">{localError || authError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                {isRegister ? 'Họ và tên' : 'Tên đăng nhập'}
              </label>
              <input
                type="text"
                placeholder={isRegister ? 'Nhập họ và tên của bạn' : 'Nhập tên đăng nhập'}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 outline-none focus:border-[#E50914] transition-colors text-sm"
              />
            </div>

            {/* Email (register only) */}
            {isRegister && (
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Nhập địa chỉ email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 outline-none focus:border-[#E50914] transition-colors text-sm"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-600 outline-none focus:border-[#E50914] transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm password (register only) */}
            {isRegister && (
              <div>
                <label className="block text-gray-400 text-sm mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    className="w-full bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-600 outline-none focus:border-[#E50914] transition-colors text-sm"
                  />
                </div>
              </div>
            )}

            {/* Forgot password */}
            {!isRegister && (
              <div className="flex justify-end -mt-1">
                <button type="button" className="text-[#E50914] text-sm hover:text-[#ff1a1a] transition-colors">
                  Quên mật khẩu?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#E50914] hover:bg-[#C40812] disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-base transition-all shadow-lg shadow-red-900/30 hover:shadow-red-900/50 active:scale-[0.98] mt-2"
            >
              {isLoading ? 'Đang xử lý...' : isRegister ? 'Tạo tài khoản' : 'Đăng Nhập'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-[#2A2A2A]" />
              <span className="text-gray-600 text-xs">HOẶC</span>
              <div className="flex-1 h-px bg-[#2A2A2A]" />
            </div>

            {/* Google login */}
            <button
              type="button"
              className="w-full bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#3A3A3A] text-white py-3.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Tiếp tục với Google
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-gray-500 text-sm mt-6">
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-[#E50914] hover:text-[#ff1a1a] font-medium transition-colors"
            >
              {isRegister ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
