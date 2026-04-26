import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BarChart2, Film, Calendar, Tag, LogOut, TrendingUp, Ticket,
  Flame, Plus, Search, Edit2, Trash2, X, Check, ChevronUp, ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { MOVIES } from '../../context/AppContext';

const formatCurrency = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + ' triệu';
  return n.toLocaleString('vi-VN') + 'đ';
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

const VOUCHERS = [
  { code: 'CINEMOON25', discount: 25, type: '%', used: 145, total: 500, expiry: '30/06/2025', status: 'active' },
  { code: 'VIP50', discount: 50, type: '%', used: 32, total: 100, expiry: '15/05/2025', status: 'active' },
  { code: 'NEWMEMBER', discount: 20, type: '%', used: 891, total: 1000, expiry: '31/12/2025', status: 'active' },
  { code: 'SUMMER2024', discount: 30, type: '%', used: 500, total: 500, expiry: '31/08/2024', status: 'expired' },
];

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
  const [searchMovie, setSearchMovie] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const tabs = [
    { id: 'stats' as TabType, label: 'Thống kê', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'movies' as TabType, label: 'Quản lý Phim', icon: <Film className="w-4 h-4" /> },
    { id: 'schedule' as TabType, label: 'Lên lịch chiếu', icon: <Calendar className="w-4 h-4" /> },
    { id: 'voucher' as TabType, label: 'Voucher', icon: <Tag className="w-4 h-4" /> },
  ];

  const filteredMovies = ADMIN_MOVIES.filter(m =>
    m.title.toLowerCase().includes(searchMovie.toLowerCase()) ||
    m.genre.toLowerCase().includes(searchMovie.toLowerCase())
  );

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

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                {
                  title: 'Tổng doanh thu tháng này',
                  value: '2.6 tỷ đồng',
                  change: '+18.2%',
                  up: true,
                  icon: <TrendingUp className="w-6 h-6 text-green-400" />,
                  color: 'text-green-400',
                  bg: 'bg-green-400/10 border-green-400/20',
                },
                {
                  title: 'Tổng vé bán ra tháng này',
                  value: '3,050 vé',
                  change: '+12.7%',
                  up: true,
                  icon: <Ticket className="w-6 h-6 text-[#E50914]" />,
                  color: 'text-[#E50914]',
                  bg: 'bg-[#E50914]/10 border-[#E50914]/20',
                },
                {
                  title: 'Phim Hot nhất',
                  value: 'Rừng Thiêng',
                  sub: '1,840 vé đã bán',
                  icon: <Flame className="w-6 h-6 text-[#F5C518]" />,
                  color: 'text-[#F5C518]',
                  bg: 'bg-[#F5C518]/10 border-[#F5C518]/20',
                },
                {
                  title: 'Tổng phim đang chiếu',
                  value: '4 phim',
                  sub: '2 phim sắp chiếu',
                  icon: <Film className="w-6 h-6 text-blue-400" />,
                  color: 'text-blue-400',
                  bg: 'bg-blue-400/10 border-blue-400/20',
                },
              ].map(({ title, value, change, up, sub, icon, color, bg }) => (
                <div key={title} className={`bg-[#1A1A1A] border rounded-xl p-5 ${bg}`}>
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-gray-500 text-xs leading-relaxed">{title}</p>
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      {icon}
                    </div>
                  </div>
                  <p className={`${color} font-bold`} style={{ fontSize: '1.4rem' }}>{value}</p>
                  {change && (
                    <div className={`flex items-center gap-1 mt-1 text-xs ${up ? 'text-green-400' : 'text-[#E50914]'}`}>
                      {up ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {change} so với tháng trước
                    </div>
                  )}
                  {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-semibold">Doanh thu 6 tháng gần nhất</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Đơn vị: tỷ đồng</p>
                </div>
                <div className="flex gap-2">
                  {['Doanh thu', 'Vé bán'].map(l => (
                    <button key={l} className="text-xs px-3 py-1.5 bg-[#252525] border border-[#333] rounded-lg text-gray-400 hover:text-white transition-colors">
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REVENUE_DATA} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {REVENUE_DATA.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === REVENUE_DATA.length - 1 ? '#E50914' : '#3A1A1A'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top movies table */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5 mt-6">
              <h3 className="text-white font-semibold mb-4">Top phim theo doanh thu</h3>
              <div className="space-y-3">
                {ADMIN_MOVIES.sort((a, b) => b.revenue - a.revenue).slice(0, 4).map((movie, idx) => (
                  <div key={movie.id} className="flex items-center gap-4">
                    <span className={`w-6 text-center font-bold text-sm ${idx === 0 ? 'text-[#F5C518]' : 'text-gray-600'}`}>
                      #{idx + 1}
                    </span>
                    <img src={movie.image} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{movie.title}</p>
                      <p className="text-gray-500 text-xs">{movie.ticketsSold.toLocaleString()} vé</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#F5C518] font-semibold text-sm">{formatCurrency(movie.revenue)}</p>
                    </div>
                    <div className="w-28 bg-[#252525] rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-[#E50914] to-[#F5C518] h-full rounded-full"
                        style={{ width: `${(movie.revenue / 174_800_000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Movies Management */}
        {activeTab === 'movies' && (
          <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Quản lý phim</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl px-4 py-2.5 gap-2 w-64">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm phim..."
                    value={searchMovie}
                    onChange={(e) => setSearchMovie(e.target.value)}
                    className="bg-transparent text-sm text-gray-300 outline-none w-full placeholder-gray-600"
                  />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-[#E50914] hover:bg-[#C40812] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Phim Mới
                </button>
              </div>
            </div>

            {/* Movie table */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#161616] border-b border-[#2A2A2A]">
                    {['Phim', 'Thể loại', 'Thời lượng', 'Giới hạn tuổi', 'Trạng thái', 'Vé đã bán', 'Doanh thu', 'Thao tác'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-gray-500 text-xs font-medium uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMovies.map((movie, idx) => (
                    <tr key={movie.id} className={`border-b border-[#222] hover:bg-white/2 transition-colors ${idx % 2 === 1 ? 'bg-[#1C1C1C]' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={movie.image} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                          <div>
                            <p className="text-white text-sm font-medium">{movie.title}</p>
                            <p className="text-gray-600 text-xs">{movie.year} · {movie.director}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-sm">{movie.genre}</td>
                      <td className="px-5 py-3.5 text-gray-400 text-sm">{movie.duration}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2 py-1 rounded font-bold ${
                          movie.rating === 'T18' ? 'bg-[#E50914]/20 text-[#E50914]' :
                          movie.rating === 'T16' ? 'bg-orange-500/20 text-orange-400' :
                          movie.rating === 'T13' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {movie.rating}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                          movie.status === 'showing'
                            ? 'bg-green-400/10 border-green-400/30 text-green-400'
                            : 'bg-[#F5C518]/10 border-[#F5C518]/30 text-[#F5C518]'
                        }`}>
                          {movie.status === 'showing' ? 'Đang chiếu' : 'Sắp chiếu'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-300 text-sm">{movie.ticketsSold.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-[#F5C518] text-sm font-semibold">{formatCurrency(movie.revenue)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/20 transition-colors group">
                            <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                          <button className="w-8 h-8 bg-[#E50914]/10 border border-[#E50914]/20 rounded-lg flex items-center justify-center hover:bg-[#E50914]/20 transition-colors">
                            <Trash2 className="w-3.5 h-3.5 text-[#E50914]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Schedule */}
        {activeTab === 'schedule' && (
          <div>
            <h2 className="text-white mb-6" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Lên lịch chiếu</h2>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => (
                  <div key={d} className={`text-center p-3 rounded-lg ${i === 4 ? 'bg-[#E50914] text-white' : 'bg-[#252525] text-gray-400'}`}>
                    <div className="text-xs mb-1">{d}</div>
                    <div className="font-bold">{24 + i}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 mt-6">
                {MOVIES.slice(0, 4).map((movie) => (
                  <div key={movie.id} className="flex items-center gap-4 p-3 bg-[#252525] rounded-xl border border-[#333]">
                    <img src={movie.image} alt={movie.title} className="w-10 h-14 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{movie.title}</p>
                      <p className="text-gray-500 text-xs">{movie.duration}</p>
                    </div>
                    <div className="flex gap-2">
                      {['09:00', '14:00', '19:30', '22:00'].map(t => (
                        <span key={t} className="text-xs px-2.5 py-1 bg-[#1A1A1A] border border-[#333] rounded-lg text-gray-400">
                          {t}
                        </span>
                      ))}
                    </div>
                    <button className="text-xs px-3 py-1.5 bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] rounded-lg hover:bg-[#E50914]/20 transition-colors">
                      Chỉnh sửa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Voucher */}
        {activeTab === 'voucher' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Quản lý Voucher</h2>
              <button className="flex items-center gap-2 bg-[#E50914] hover:bg-[#C40812] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
                <Plus className="w-4 h-4" />
                Tạo Voucher mới
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {VOUCHERS.map((v) => (
                <div key={v.code} className={`bg-[#1A1A1A] border rounded-xl p-5 ${v.status === 'active' ? 'border-[#2A2A2A]' : 'border-[#222] opacity-60'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[#F5C518] font-mono font-bold">{v.code}</p>
                      <p className="text-gray-500 text-xs mt-0.5">Hết hạn: {v.expiry}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                      v.status === 'active'
                        ? 'bg-green-400/10 border-green-400/30 text-green-400'
                        : 'bg-gray-500/10 border-gray-500/30 text-gray-500'
                    }`}>
                      {v.status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-[#E50914] font-bold" style={{ fontSize: '2rem' }}>-{v.discount}%</div>
                    <div className="text-gray-500 text-xs">
                      Đã dùng: {v.used}/{v.total}
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#252525] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${v.used >= v.total ? 'bg-gray-500' : 'bg-[#E50914]'}`}
                      style={{ width: `${(v.used / v.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1">
                      <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                    </button>
                    <button className="flex-1 py-2 bg-[#E50914]/10 border border-[#E50914]/20 text-[#E50914] rounded-lg text-xs hover:bg-[#E50914]/20 transition-colors flex items-center justify-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Movie Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Thêm phim mới</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 bg-[#252525] rounded-full flex items-center justify-center hover:bg-[#333] transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Tên phim', placeholder: 'Nhập tên phim...' },
                { label: 'Đạo diễn', placeholder: 'Tên đạo diễn' },
                { label: 'Thể loại', placeholder: 'VD: Hành động / Phiêu lưu' },
                { label: 'Thời lượng', placeholder: 'VD: 120 phút' },
              ].map(({ label, placeholder }) => (
                <div key={label}>
                  <label className="text-gray-400 text-sm mb-1.5 block">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 outline-none focus:border-[#E50914]/50 text-sm transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Giới hạn độ tuổi</label>
                <select className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-2.5 text-white text-sm outline-none">
                  <option>P</option><option>T13</option><option>T16</option><option>T18</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-[#252525] border border-[#333] text-gray-300 rounded-xl text-sm hover:bg-[#2A2A2A] transition-colors">
                Hủy
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-[#E50914] text-white rounded-xl text-sm font-semibold hover:bg-[#C40812] transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Thêm phim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
