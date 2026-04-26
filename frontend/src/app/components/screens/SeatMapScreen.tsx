import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Clock, MapPin, Film, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Seat configuration
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = Array.from({ length: 12 }, (_, i) => i + 1);
const VIP_ROWS = ['D', 'E', 'F'];

// Pre-booked seats
const BOOKED_SEATS = new Set([
  'A2', 'A3', 'A8', 'A9',
  'B4', 'B5', 'B6',
  'C1', 'C7', 'C8', 'C11',
  'D3', 'D9', 'D10',
  'E1', 'E2', 'E5', 'E6', 'E11', 'E12',
  'F4', 'F7', 'F8',
  'G2', 'G3', 'G9', 'G10',
  'H5', 'H6', 'H7',
]);

type SeatStatus = 'available' | 'booked' | 'selected' | 'vip-available';

const getSeatStatus = (row: string, col: number, selectedSeats: string[]): SeatStatus => {
  const key = `${row}${col}`;
  if (BOOKED_SEATS.has(key)) return 'booked';
  if (selectedSeats.includes(key)) return 'selected';
  if (VIP_ROWS.includes(row)) return 'vip-available';
  return 'available';
};

const formatCurrency = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const TICKET_PRICE_MAP: Record<SeatStatus, number> = {
  'available': 85000,
  'vip-available': 110000,
  'booked': 0,
  'selected': 0,
};

export const SeatMapScreen = () => {
  const navigate = useNavigate();
  const { selectedMovie, selectedSeats, setSelectedSeats, selectedShowtime, selectedDate, selectedCinema } = useApp();

  const [timeLeft, setTimeLeft] = useState(9 * 60 + 59); // 9:59

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const formatDateLabel = (iso: string) => {
    if (!iso) return 'Hôm nay';
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const handleSeatClick = useCallback((row: string, col: number) => {
    const key = `${row}${col}`;
    if (BOOKED_SEATS.has(key)) return;
    setSelectedSeats(
      selectedSeats.includes(key)
        ? selectedSeats.filter(s => s !== key)
        : [...selectedSeats, key]
    );
  }, [selectedSeats, setSelectedSeats]);

  const totalPrice = selectedSeats.reduce((sum, seat) => {
    const row = seat[0];
    const isVip = VIP_ROWS.includes(row);
    return sum + (isVip ? 110000 : 85000);
  }, 0);

  const serviceFee = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + serviceFee;

  const movie = selectedMovie;
  if (!movie) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Chưa chọn phim</p>
          <button onClick={() => navigate('/home')} className="bg-[#E50914] text-white px-6 py-2 rounded-lg">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="bg-[#121212]">
      {/* Sub-header */}
      <div className="bg-[#0D0D0D] border-b border-[#2A2A2A] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/showtime')}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Quay lại</span>
          </button>
          <div className="w-px h-5 bg-[#2A2A2A]" />
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#E50914]" />
            <span className="text-white font-medium text-sm">{movie.title}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            {selectedShowtime} · {formatDateLabel(selectedDate)}
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin className="w-4 h-4" />
            {selectedCinema}
          </div>
        </div>
        {/* Countdown */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${timeLeft < 120 ? 'border-[#E50914] bg-[#E50914]/10' : 'border-[#2A2A2A] bg-[#1A1A1A]'}`}>
          <Clock className={`w-4 h-4 ${timeLeft < 120 ? 'text-[#E50914]' : 'text-gray-400'}`} />
          <span className={`font-bold font-mono text-sm ${timeLeft < 120 ? 'text-[#E50914]' : 'text-gray-300'}`}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-gray-500 text-xs">Thời gian giữ ghế</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Seat map — 70% */}
        <div className="flex-1 flex flex-col items-center overflow-auto py-6 px-8">
          {/* Screen arc */}
          <div className="w-full max-w-2xl mb-8">
            <div
              className="relative h-10 mx-8"
              style={{
                background: 'linear-gradient(to bottom, rgba(229,9,20,0.15), transparent)',
                borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                border: '2px solid rgba(229,9,20,0.4)',
                borderBottom: 'none',
              }}
            />
            <p className="text-center text-gray-500 text-xs tracking-widest uppercase mt-1">Màn hình</p>
          </div>

          {/* Seat grid */}
          <div className="w-full max-w-2xl">
            {ROWS.map((row) => (
              <div key={row} className="flex items-center gap-2 mb-2">
                {/* Row label */}
                <span className="w-6 text-gray-600 text-xs text-center flex-shrink-0">{row}</span>

                {/* Seats */}
                <div className="flex gap-1.5 flex-1 justify-center">
                  {COLS.map((col) => {
                    const status = getSeatStatus(row, col, selectedSeats);
                    const key = `${row}${col}`;

                    // Aisle gap
                    const gap = col === 4 || col === 10;

                    return (
                      <React.Fragment key={key}>
                        {gap && <div className="w-3" />}
                        <button
                          onClick={() => handleSeatClick(row, col)}
                          disabled={status === 'booked'}
                          title={`Ghế ${key}${VIP_ROWS.includes(row) ? ' (VIP)' : ''}`}
                          className={`
                            w-7 h-6 rounded-t-lg text-[9px] font-medium transition-all
                            ${status === 'booked'
                              ? 'bg-[#E50914]/80 text-white cursor-not-allowed'
                              : status === 'selected'
                                ? 'bg-[#F5C518] text-[#121212] shadow-md shadow-yellow-500/40 scale-110'
                                : status === 'vip-available'
                                  ? 'bg-[#2A1F00] border border-[#F5C518]/30 text-[#F5C518]/70 hover:bg-[#F5C518]/20 hover:border-[#F5C518] hover:text-[#F5C518]'
                                  : 'bg-[#252525] border border-[#3A3A3A] text-gray-600 hover:bg-[#3A3A3A] hover:text-white hover:border-gray-500'
                            }
                          `}
                        >
                          {col}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Row label right */}
                <span className="w-6 text-gray-600 text-xs text-center flex-shrink-0">{row}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-8 mt-8 pb-4">
            {[
              { color: 'bg-[#252525] border border-[#3A3A3A]', label: 'Trống (85K)' },
              { color: 'bg-[#2A1F00] border border-[#F5C518]/40', label: 'VIP (110K)', textColor: 'text-[#F5C518]' },
              { color: 'bg-[#F5C518]', label: 'Đang chọn' },
              { color: 'bg-[#E50914]/80', label: 'Đã bán' },
            ].map(({ color, label, textColor }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-6 h-5 rounded-t ${color}`} />
                <span className={`text-xs ${textColor || 'text-gray-500'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Order summary — 30% */}
        <div className="w-80 border-l border-[#2A2A2A] bg-[#161616] flex flex-col overflow-auto">
          {/* Movie poster + info */}
          <div className="p-5 border-b border-[#2A2A2A]">
            <div className="flex gap-3 mb-4">
              <img src={movie.image} alt={movie.title} className="w-16 h-22 object-cover rounded-lg flex-shrink-0" style={{ height: '88px' }} />
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">{movie.title}</h3>
                <p className="text-gray-500 text-xs mb-1">{movie.genre}</p>
                <p className="text-gray-500 text-xs">{movie.duration}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Giờ chiếu
                </span>
                <span className="text-white font-medium">{selectedShowtime}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Ngày chiếu</span>
                <span className="text-white">{formatDateLabel(selectedDate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Rạp
                </span>
                <span className="text-white text-right text-xs max-w-[160px]">{selectedCinema}</span>
              </div>
            </div>
          </div>

          {/* Selected seats */}
          <div className="p-5 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-1.5 mb-3">
              <Info className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-400 text-sm">Ghế đã chọn</span>
            </div>
            {selectedSeats.length === 0 ? (
              <p className="text-gray-600 text-sm italic">Chưa chọn ghế nào</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedSeats.sort().map(seat => {
                  const isVip = VIP_ROWS.includes(seat[0]);
                  return (
                    <span
                      key={seat}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                        isVip
                          ? 'bg-[#F5C518]/15 border border-[#F5C518]/40 text-[#F5C518]'
                          : 'bg-[#252525] border border-[#3A3A3A] text-white'
                      }`}
                    >
                      {seat}
                      {isVip && <span className="ml-1 text-[10px]">VIP</span>}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Price breakdown */}
          <div className="p-5 border-b border-[#2A2A2A] space-y-3">
            <h4 className="text-gray-400 text-sm">Chi tiết thanh toán</h4>
            {selectedSeats.map(seat => {
              const isVip = VIP_ROWS.includes(seat[0]);
              const price = isVip ? 110000 : 85000;
              return (
                <div key={seat} className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Ghế {seat} {isVip ? '(VIP)' : '(Thường)'}
                  </span>
                  <span className="text-gray-300">{formatCurrency(price)}</span>
                </div>
              );
            })}
            {selectedSeats.length > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phí dịch vụ (5%)</span>
                  <span className="text-gray-300">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="h-px bg-[#2A2A2A]" />
              </>
            )}
            <div className="flex justify-between">
              <span className="text-white font-semibold">Tổng cộng</span>
              <span className="text-[#F5C518] font-bold text-lg">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="p-5 mt-auto">
            <button
              disabled={selectedSeats.length === 0}
              onClick={() => navigate('/checkout')}
              className={`w-full py-4 rounded-xl font-bold text-base transition-all ${
                selectedSeats.length > 0
                  ? 'bg-[#E50914] hover:bg-[#C40812] text-white shadow-lg shadow-red-900/30 active:scale-[0.98]'
                  : 'bg-[#2A2A2A] text-gray-600 cursor-not-allowed'
              }`}
            >
              {selectedSeats.length === 0 ? 'Chọn ghế để tiếp tục' : 'Tiếp tục thanh toán →'}
            </button>
            {selectedSeats.length > 0 && (
              <p className="text-center text-gray-600 text-xs mt-2">
                {selectedSeats.length} ghế · Tổng {formatCurrency(grandTotal)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};