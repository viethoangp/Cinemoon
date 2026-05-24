import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Clock, MapPin, Film, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { catalogAPI, bookingAPI } from '../../../services/api';

interface ApiSeat {
  MAGHE: string;
  TENGHE: string;
  MALOAIGHE: string;
  TRANGTHAI: string;
  TENLOAI: string;
}

export const SeatMapScreen = () => {
  const navigate = useNavigate();
  const { 
    selectedMovie, 
    selectedSeats, 
    setSelectedSeats, 
    selectedShowtime, 
    selectedDate, 
    selectedCinema,
    selectedSuatChieu, // Thêm cái này để lấy MAPHONG
    toggleSeat 
  } = useApp();

  const [seats, setSeats] = useState<ApiSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(9 * 60 + 59); // 9:59
  const [isHolding, setIsHolding] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [bookedSeatIds, setBookedSeatIds] = useState<Set<string>>(new Set());
  const [seatTypePrices, setSeatTypePrices] = useState<Record<string, { base: number; withFee: number }>>({
    'LG001': { base: 85000, withFee: 89250 }, // Standard - default values
    'LG002': { base: 110000, withFee: 115500 } // VIP - default values
  });
  const [priceData, setPriceData] = useState({
    ticketTotal: 0,
    serviceFee: 0,
    grandTotal: 0,
  });

  // Đếm ngược giữ ghế
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // Fetch dynamic prices for seat types when date/time changes
  useEffect(() => {
    const fetchDynamicPrices = async () => {
      if (!selectedDate || !selectedShowtime) return;

      try {
        const seatTypeIds = ['LG001', 'LG002']; // Standard, VIP (excluding LG003 Sweetbox)
        const priceMap: Record<string, { base: number; withFee: number }> = {};

        for (const seatTypeId of seatTypeIds) {
          try {
            const priceResponse = await bookingAPI.calculatePrice({
              maloaighe: seatTypeId,
              maloaikhach: 'LK001',
              ngaychieu: selectedDate,
              giobatdau: selectedShowtime,
            });
            const basePrice = Number(priceResponse.price || 0);
            const withFee = basePrice + Math.round(basePrice * 0.05);
            priceMap[seatTypeId] = { base: basePrice, withFee };
          } catch (error) {
            console.error(`Lỗi tính giá cho ${seatTypeId}:`, error);
          }
        }

        // Only update if we have valid prices
        if (Object.keys(priceMap).length > 0) {
          setSeatTypePrices(prev => ({ ...prev, ...priceMap }));
        }
      } catch (error) {
        console.error('Lỗi fetch dynamic prices:', error);
      }
    };

    fetchDynamicPrices();
  }, [selectedDate, selectedShowtime]);

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


  // 1. ÁO GIÁP BẢO VỆ & PHỤC DỰNG GHẾ TỪ ORACLE
  const fetchSeats = useCallback(async () => {
    try {
      setLoading(true);
      const maphong = selectedSuatChieu?.MAPHONG || 'PC001';
      const masuat = selectedSuatChieu?.MASUAT;

      const [seatData, bookedData] = await Promise.all([
        catalogAPI.getSeats(maphong),
        masuat ? catalogAPI.getBookedSeats(masuat) : Promise.resolve([]),
      ]);

      const rawData = Array.isArray(seatData) ? seatData : [];
      const bookedIds = new Set(
        (Array.isArray(bookedData) ? bookedData : [])
          .map((seat: any) => seat.MAGHE || seat.maghe || seat.id)
          .filter(Boolean)
      );

      // CHUẨN HÓA VÀ PHỤC DỰNG DỮ LIỆU
      const safeSeats: ApiSeat[] = rawData.map((s: any, index: number) => {
        const maGhe = s.MAGHE || s.maghe || s.id || `MOCK_${index}`;
        let tenGhe = s.TENGHE || s.tenghe || s.VITRI || s.vitri || s.name || '';

        // THUẬT TOÁN BIẾN GHE001 -> A1
        if (!tenGhe && maGhe.toUpperCase().includes('GHE')) {
          const numMatch = maGhe.match(/\d+/);
          if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            const rowIndex = Math.floor((num - 1) / 12); // Dòng A, B, C... (chia 12 ghế/dòng)
            const colIndex = ((num - 1) % 12) + 1;       // Cột 1, 2, 3...
            tenGhe = `${String.fromCharCode(65 + rowIndex)}${colIndex}`;
          }
        } else if (!tenGhe) {
          // Nếu format mã ghế khác, cứ đánh bừa A1, A2 để không bị lỗi màn hình
          tenGhe = `A${index + 1}`;
        }

        return {
          MAGHE: maGhe,
          TENGHE: tenGhe,
          MALOAIGHE: s.MALOAIGHE || s.maloaighe || 'LG001',
          TRANGTHAI: bookedIds.has(maGhe) ? 'Booked' : (s.TRANGTHAI || s.trangthai || s.status || 'Available'),
          TENLOAI: s.TENLOAI || s.tenloai || s.type || (['D', 'E', 'F'].includes(tenGhe.charAt(0)) ? 'VIP' : 'Standard')
        };
      }).filter(s => s.TENGHE !== '' && s.MALOAIGHE !== 'LG003');

      setSeats(safeSeats);
      setBookedSeatIds(bookedIds);
    } catch (error) {
      console.error('Lỗi khi lấy sơ đồ ghế:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSuatChieu?.MAPHONG, selectedSuatChieu?.MASUAT]);

  useEffect(() => {
    fetchSeats();

    const intervalId = window.setInterval(() => {
      fetchSeats();
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSeats();
      }
    };

    window.addEventListener('focus', fetchSeats);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', fetchSeats);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchSeats, refreshTrigger]);

  // 2. NHÓM DÒNG
  const groupedSeats = seats.reduce((acc, seat) => {
    const row = seat.TENGHE.charAt(0);
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {} as Record<string, ApiSeat[]>);

  const rows = Object.keys(groupedSeats).sort();

  // 3. KIỂM TRA TRẠNG THÁI MÀU GHẾ
  const getSeatStatus = (seat: ApiSeat): 'available' | 'booked' | 'selected' | 'vip-available' => {
    if (bookedSeatIds.has(seat.MAGHE) || seat.TRANGTHAI !== 'Available') return 'booked';
    if (selectedSeats.includes(seat.MAGHE)) return 'selected';
    if (seat.TENLOAI === 'VIP' || seat.MALOAIGHE === 'LG002') return 'vip-available';
    return 'available';
  };

  const handleSeatClick = useCallback((maghe: string) => {
    // Chống sập nếu Context chưa nạp kịp
    if (toggleSeat) {
      toggleSeat(maghe);
    } else if (setSelectedSeats) {
      setSelectedSeats(
        selectedSeats.includes(maghe)
          ? selectedSeats.filter(s => s !== maghe)
          : [...selectedSeats, maghe]
      );
    }
  }, [selectedSeats, toggleSeat, setSelectedSeats]);

  // Tính tiền
  const selectedSeatObjects = seats.filter(s => selectedSeats.includes(s.MAGHE));
  useEffect(() => {
    const recalculatePrice = async () => {
      if (!selectedSeatObjects.length || !selectedDate || !selectedShowtime) {
        setPriceData({ ticketTotal: 0, serviceFee: 0, grandTotal: 0 });
        return;
      }

      try {
        setIsLoadingPrice(true);
        const priceCache = new Map<string, number>();
        let ticketTotal = 0;

        for (const seat of selectedSeatObjects) {
          const seatTypeId = seat.MALOAIGHE || (seat.TENLOAI === 'VIP' ? 'LG002' : 'LG001');
          if (!priceCache.has(seatTypeId)) {
            const priceResponse = await bookingAPI.calculatePrice({
              maloaighe: seatTypeId,
              maloaikhach: 'LK001',
              ngaychieu: selectedDate,
              giobatdau: selectedShowtime,
            });
            priceCache.set(seatTypeId, Number(priceResponse.price || 0));
          }
          ticketTotal += priceCache.get(seatTypeId) || 0;
        }

        const serviceFee = Math.round(ticketTotal * 0.05);
        setPriceData({ ticketTotal, serviceFee, grandTotal: ticketTotal + serviceFee });
      } catch (error) {
        console.error('Lỗi tính giá ghế:', error);
        const ticketTotal = selectedSeatObjects.reduce((sum, seat) => {
          const isVip = seat.TENLOAI === 'VIP' || seat.MALOAIGHE === 'LG002';
          return sum + (isVip ? 110000 : 85000);
        }, 0);
        const serviceFee = ticketTotal > 0 ? Math.round(ticketTotal * 0.05) : 0;
        setPriceData({ ticketTotal, serviceFee, grandTotal: ticketTotal + serviceFee });
      } finally {
        setIsLoadingPrice(false);
      }
    };

    recalculatePrice();
  }, [selectedSeats.join(','), selectedDate, selectedShowtime, seats.length]);

  const ticketTotal = priceData.ticketTotal;
  const serviceFee = priceData.serviceFee;
  const grandTotal = priceData.grandTotal;

  const formatCurrency = (n: number) => n.toLocaleString('vi-VN') + 'đ';
  const handleContinue = async () => {
    if (selectedSeats.length === 0 || !selectedSuatChieu) return;

    try {
      setIsHolding(true);
      // DEBUG: Log dữ liệu trước khi gửi
      console.log('[SeatMapScreen handleContinue] Dữ liệu trước gửi:', {
        selectedSuatChieu: selectedSuatChieu,
        MASUAT: selectedSuatChieu?.MASUAT,
        MASUAT_type: typeof selectedSuatChieu?.MASUAT,
        selectedSeats: selectedSeats,
        selectedSeats_length: selectedSeats.length,
      });

      const response = await bookingAPI.holdSeats(selectedSuatChieu.MASUAT, selectedSeats);
      
      // 1. Thêm dòng log này để anh em mình xem mặt mũi dữ liệu nó ra sao
      console.log("[SeatMapScreen] Dữ liệu HoldSeats trả về:", response); 

      // 2. Sửa lại cách lấy MAGD (Bao lô cả 2 trường hợp có data và không có data)
      const maGiaoDich = response?.data?.magd || response?.magd;

      if (maGiaoDich) {
        sessionStorage.setItem('pendingMaGD', maGiaoDich);
        console.log("Đã lưu mã GD vào Session:", maGiaoDich);
      } else {
        console.error("LỖI NẶNG: Backend không trả về magd!");
      }
      
      navigate('/checkout');
    } catch (error: any) {
      // Nếu Backend báo lỗi (ví dụ ghế đã bị nẫng tay trên)
      alert('Ghế bạn chọn vừa có người khác giữ. Vui lòng chọn ghế khác!');
      if (setSelectedSeats) setSelectedSeats([]);
      // Tải lại sơ đồ ghế để cập nhật trạng thái mới nhất từ DB
      setRefreshTrigger(prev => prev + 1);
    } finally {
      setIsHolding(false);
    }
  };
  const movie = selectedMovie;
  if (!movie || !selectedSuatChieu) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212] text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Đang khôi phục dữ liệu phòng chiếu...</p>
          <button onClick={() => navigate('/home')} className="bg-[#E50914] text-white px-6 py-2 rounded-lg mt-2">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }} className="bg-[#121212]">
      {/* Sub-header */}
      <div className="bg-[#0D0D0D] border-b border-[#2A2A2A] px-4 md:px-8 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm hidden md:inline">Quay lại</span>
          </button>
          <div className="w-px h-5 bg-[#2A2A2A]" />
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#E50914] hidden md:block" />
            <span className="text-white font-medium text-sm line-clamp-1">{movie.title}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            {selectedShowtime || '19:30'} · {formatDateLabel(selectedDate)}
          </div>
        </div>
        {/* Countdown */}
        <div className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border ${timeLeft < 120 ? 'border-[#E50914] bg-[#E50914]/10' : 'border-[#2A2A2A] bg-[#1A1A1A]'}`}>
          <Clock className={`w-4 h-4 ${timeLeft < 120 ? 'text-[#E50914]' : 'text-gray-400'}`} />
          <span className={`font-bold font-mono text-sm ${timeLeft < 120 ? 'text-[#E50914]' : 'text-gray-300'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* LEFT: Seat map */}
        <div className="flex-1 flex flex-col items-center overflow-auto py-6 px-4">
          <div className="w-full mb-6" style={{ maxWidth: '600px' }}>
            <div className="relative h-6 md:h-10 mx-8" style={{
                background: 'linear-gradient(to bottom, rgba(229,9,20,0.15), transparent)',
                borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
                border: '2px solid rgba(229,9,20,0.4)',
                borderBottom: 'none',
              }}
            />
            <p className="text-center text-gray-500 text-[10px] md:text-xs tracking-widest uppercase mt-1">Màn hình</p>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            /* Bọc ngoài: chiếm toàn bộ chiều rộng, padding nhỏ, không scroll ngang */
            <div className="w-full pb-10" style={{ maxWidth: '600px' }}>
              {rows.map((rowLabel) => {
                const rowSeats = groupedSeats[rowLabel]
                  .sort((a, b) => a.TENGHE.localeCompare(b.TENGHE, undefined, { numeric: true }));

                return (
                  <div key={rowLabel} className="flex items-center mb-[5px]">
                    {/* Label hàng bên trái - cố định 20px */}
                    <span
                      className="text-gray-500 text-[11px] font-medium text-center flex-shrink-0 select-none"
                      style={{ width: '20px' }}
                    >
                      {rowLabel}
                    </span>

                    {/* Lối đi trái (cột 1-4) */}
                    <div className="flex gap-[3px] flex-shrink-0">
                      {rowSeats.slice(0, 4).map((seat) => {
                        const status = getSeatStatus(seat);
                        const isVip = status === 'vip-available';
                        return (
                          <button
                            key={seat.MAGHE}
                            onClick={() => handleSeatClick(seat.MAGHE)}
                            disabled={status === 'booked'}
                            title={seat.TENGHE}
                            className={`
                              w-[38px] h-[28px] rounded-t text-[9px] font-medium transition-all flex-shrink-0
                              ${status === 'booked'
                                ? 'bg-[#E50914]/80 text-white cursor-not-allowed'
                                : status === 'selected'
                                  ? 'bg-[#F5C518] text-[#121212] shadow-md shadow-yellow-500/40 scale-105'
                                  : isVip
                                    ? 'bg-[#2A1F00] border border-[#F5C518]/40 text-[#F5C518]/70 hover:bg-[#F5C518]/20 hover:border-[#F5C518] hover:text-[#F5C518]'
                                    : 'bg-[#252525] border border-[#3A3A3A] text-gray-500 hover:bg-[#3A3A3A] hover:text-white hover:border-gray-500'
                              }
                            `}
                          >
                            {seat.TENGHE.replace(/[A-Za-z]/, '')}
                          </button>
                        );
                      })}
                    </div>

                    {/* Lối đi giữa */}
                    <div className="flex-shrink-0" style={{ width: '16px' }} />

                    {/* Giữa (cột 5-8) */}
                    <div className="flex gap-[3px] flex-shrink-0">
                      {rowSeats.slice(4, 8).map((seat) => {
                        const status = getSeatStatus(seat);
                        const isVip = status === 'vip-available';
                        return (
                          <button
                            key={seat.MAGHE}
                            onClick={() => handleSeatClick(seat.MAGHE)}
                            disabled={status === 'booked'}
                            title={seat.TENGHE}
                            className={`
                              w-[38px] h-[28px] rounded-t text-[9px] font-medium transition-all flex-shrink-0
                              ${status === 'booked'
                                ? 'bg-[#E50914]/80 text-white cursor-not-allowed'
                                : status === 'selected'
                                  ? 'bg-[#F5C518] text-[#121212] shadow-md shadow-yellow-500/40 scale-105'
                                  : isVip
                                    ? 'bg-[#2A1F00] border border-[#F5C518]/40 text-[#F5C518]/70 hover:bg-[#F5C518]/20 hover:border-[#F5C518] hover:text-[#F5C518]'
                                    : 'bg-[#252525] border border-[#3A3A3A] text-gray-500 hover:bg-[#3A3A3A] hover:text-white hover:border-gray-500'
                              }
                            `}
                          >
                            {seat.TENGHE.replace(/[A-Za-z]/, '')}
                          </button>
                        );
                      })}
                    </div>

                    {/* Lối đi giữa */}
                    <div className="flex-shrink-0" style={{ width: '16px' }} />

                    {/* Phải (cột 9-12) */}
                    <div className="flex gap-[3px] flex-shrink-0">
                      {rowSeats.slice(8, 12).map((seat) => {
                        const status = getSeatStatus(seat);
                        const isVip = status === 'vip-available';
                        return (
                          <button
                            key={seat.MAGHE}
                            onClick={() => handleSeatClick(seat.MAGHE)}
                            disabled={status === 'booked'}
                            title={seat.TENGHE}
                            className={`
                              w-[38px] h-[28px] rounded-t text-[9px] font-medium transition-all flex-shrink-0
                              ${status === 'booked'
                                ? 'bg-[#E50914]/80 text-white cursor-not-allowed'
                                : status === 'selected'
                                  ? 'bg-[#F5C518] text-[#121212] shadow-md shadow-yellow-500/40 scale-105'
                                  : isVip
                                    ? 'bg-[#2A1F00] border border-[#F5C518]/40 text-[#F5C518]/70 hover:bg-[#F5C518]/20 hover:border-[#F5C518] hover:text-[#F5C518]'
                                    : 'bg-[#252525] border border-[#3A3A3A] text-gray-500 hover:bg-[#3A3A3A] hover:text-white hover:border-gray-500'
                              }
                            `}
                          >
                            {seat.TENGHE.replace(/[A-Za-z]/, '')}
                          </button>
                        );
                      })}
                    </div>

                    {/* Label hàng bên phải */}
                    <span
                      className="text-gray-500 text-[11px] font-medium text-center flex-shrink-0 select-none ml-[4px]"
                      style={{ width: '20px' }}
                    >
                      {rowLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mt-4 pb-4">
            {[
              { 
                color: 'bg-[#252525] border border-[#3A3A3A]', 
                label: `Thường (${Math.round(seatTypePrices['LG001'].base / 1000)}K + 5% phí)` 
              },
              { 
                color: 'bg-[#2A1F00] border border-[#F5C518]/40', 
                label: `VIP (${Math.round(seatTypePrices['LG002'].base / 1000)}K + 5% phí)`, 
                textColor: 'text-[#F5C518]' 
              },
              { color: 'bg-[#F5C518]', label: 'Đang chọn', textColor: 'text-gray-300' },
              { color: 'bg-[#E50914]/80', label: 'Đã bán', textColor: 'text-gray-300' },
            ].map(({ color, label, textColor }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-5 h-4 md:w-6 md:h-5 rounded-t ${color}`} />
                <span className={`text-[10px] md:text-xs ${textColor || 'text-gray-500'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Order summary */}
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#2A2A2A] bg-[#161616] flex flex-col md:h-full">
          <div className="p-4 md:p-5 border-b border-[#2A2A2A] hidden md:block">
            <div className="flex gap-3 mb-4">
              <img src={movie.image} alt={movie.title} className="w-16 object-cover rounded-lg flex-shrink-0" style={{ height: '88px' }} />
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">{movie.title}</h3>
                <p className="text-gray-500 text-xs mb-1">{movie.genre}</p>
                <p className="text-gray-500 text-xs">{movie.duration}</p>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-5 border-b border-[#2A2A2A] max-h-[150px] overflow-auto">
            <div className="flex items-center gap-1.5 mb-2 md:mb-3">
              <Info className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-400 text-sm">Ghế đã chọn</span>
            </div>
            {selectedSeatObjects.length === 0 ? (
              <p className="text-gray-600 text-sm italic">Chưa chọn ghế nào</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedSeatObjects.map(seat => {
                  const isVip = seat.TENLOAI === 'VIP' || seat.MALOAIGHE === 'LG002';
                  return (
                    <span key={seat.MAGHE} className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-bold ${
                        isVip ? 'bg-[#F5C518]/15 border border-[#F5C518]/40 text-[#F5C518]' : 'bg-[#252525] border border-[#3A3A3A] text-white'
                      }`}
                    >
                      {seat.TENGHE}
                      {isVip && <span className="ml-1 text-[9px] md:text-[10px]">VIP</span>}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 md:p-5 bg-gradient-to-t from-[#161616] to-transparent mt-auto space-y-2 md:space-y-3">
            <div className="flex justify-between">
              <span className="text-white font-semibold text-sm md:text-base">Tổng cộng</span>
              <span className="text-[#F5C518] font-bold text-base md:text-lg">{isLoadingPrice ? '...' : formatCurrency(grandTotal)}</span>
            </div>
            <button
              // Sửa disabled: thêm điều kiện isHolding để tránh khách bấm liên tục
              disabled={selectedSeats.length === 0 || isHolding || isLoadingPrice}

              // Sửa onClick: gọi hàm handleContinue thay vì navigate trực tiếp
              onClick={handleContinue}

              className={`w-full py-3 md:py-4 rounded-xl font-bold text-sm md:text-base transition-all ${selectedSeats.length > 0 && !isHolding
                  ? 'bg-[#E50914] hover:bg-[#C40812] text-white shadow-lg shadow-red-900/30'
                  : 'bg-[#2A2A2A] text-gray-600 cursor-not-allowed'
                }`}
            >
              {/* Hiển thị text linh hoạt theo trạng thái */}
              {isHolding ? 'Đang khóa ghế...' : (isLoadingPrice ? 'Đang tính giá...' : (selectedSeats.length === 0 ? 'Chọn ghế để tiếp tục' : 'Tiếp tục thanh toán →'))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};