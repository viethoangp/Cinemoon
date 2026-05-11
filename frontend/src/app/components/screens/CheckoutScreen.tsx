import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Tag, Check, AlertCircle, Film, MapPin, Clock, Ticket, Loader, QrCode } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { bookingAPI, catalogAPI } from '../../../services/api';
import { getToken } from '../../../utils/token';

const VIP_ROWS = ['D', 'E', 'F'];

const formatCurrency = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const PAYMENT_METHODS = [
  { id: 'momo', name: 'Ví MoMo', icon: '💜', desc: 'Thanh toán nhanh qua ví MoMo' },
  { id: 'vnpay', name: 'VNPay', icon: '🔵', desc: 'Thanh toán qua VNPay QR' },
  { id: 'zalopay', name: 'ZaloPay', icon: '🔷', desc: 'Thanh toán qua ZaloPay' },
  { id: 'atm', name: 'Thẻ ATM / Tài khoản ngân hàng', icon: '🏦', desc: 'Internet Banking' },
  { id: 'cash', name: 'Tiền mặt tại quầy', icon: '💵', desc: 'Thanh toán trực tiếp tại rạp' },
];

const formatDateLabel = (iso: string) => {
  if (!iso) return 'Hôm nay';
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

interface PriceData {
  ticketTotal: number;
  serviceFee: number;
  discount: number;
  grandTotal: number;
}

interface ApiSeat {
  MAGHE: string;
  TENGHE: string;
  MALOAIGHE: string;
  TRANGTHAI: string;
  TENLOAI: string;
}

export const CheckoutScreen = () => {
  const navigate = useNavigate();
  const { selectedMovie, selectedSeats, selectedShowtime, selectedDate, selectedCinema, selectedSuatChieu } = useApp();

  // UI State
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [promoCode, setPromoCode] = useState('');
  
  // Pricing State
  const [priceData, setPriceData] = useState<PriceData>({
    ticketTotal: 0,
    serviceFee: 0,
    discount: 0,
    grandTotal: 0,
  });
  const [roomSeats, setRoomSeats] = useState<ApiSeat[]>([]);
  
  // API Loading States
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Error States
  const [priceError, setPriceError] = useState('');
  const [promoError, setPromoError] = useState('');
  const [submitError, setSubmitError] = useState('');
  
  // Success State
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const selectedSeatObjects = roomSeats.filter(seat => selectedSeats.includes(seat.MAGHE));

  const normalizeSeatType = (seat: ApiSeat) => {
    if (seat.MALOAIGHE) return seat.MALOAIGHE;
    if (seat.TENLOAI?.toUpperCase() === 'VIP') return 'LG002';
    return 'LG001';
  };

  useEffect(() => {
    const fetchSeatData = async () => {
      if (!selectedSuatChieu?.MAPHONG) {
        setRoomSeats([]);
        return;
      }

      try {
        setIsLoadingSeats(true);
        const rawData = await catalogAPI.getSeats(selectedSuatChieu.MAPHONG);
        const normalizedSeats = Array.isArray(rawData) ? rawData.map((seat: any, index: number): ApiSeat => ({
          MAGHE: seat.MAGHE || seat.maghe || seat.id || `MOCK_${index}`,
          TENGHE: seat.TENGHE || seat.tenghe || seat.name || `A${index + 1}`,
          MALOAIGHE: seat.MALOAIGHE || seat.maloaighe || 'LG001',
          TRANGTHAI: seat.TRANGTHAI || seat.trangthai || seat.status || 'Available',
          TENLOAI: seat.TENLOAI || seat.tenloai || seat.type || 'Standard',
        })) : [];
        setRoomSeats(normalizedSeats);
      } catch (error) {
        console.error('[CheckoutScreen] Cannot load seat metadata:', error);
        setRoomSeats([]);
      } finally {
        setIsLoadingSeats(false);
      }
    };

    fetchSeatData();
  }, [selectedSuatChieu?.MAPHONG]);

  // Calculate price from backend whenever selected seats or room data changes
  useEffect(() => {
    calculatePriceFromBackend();
  }, [selectedSeats, selectedSeatObjects.length, selectedDate, selectedShowtime, selectedSuatChieu?.MAPHONG]);

  const calculatePriceFromBackend = async () => {
    if (!selectedSeats.length || !selectedDate || !selectedShowtime) {
      setPriceData({ ticketTotal: 0, serviceFee: 0, discount: 0, grandTotal: 0 });
      return;
    }

    setIsLoadingPrice(true);
    setPriceError('');

    try {
      const seatSource = selectedSeatObjects.length > 0
        ? selectedSeatObjects
        : selectedSeats.map((seatId) => ({
            MAGHE: seatId,
            TENGHE: seatId,
            MALOAIGHE: VIP_ROWS.includes(seatId.charAt(0)) ? 'LG002' : 'LG001',
            TRANGTHAI: 'Available',
            TENLOAI: VIP_ROWS.includes(seatId.charAt(0)) ? 'VIP' : 'Standard',
          } as ApiSeat));

      let ticketTotal = 0;
      const priceCache = new Map<string, number>();

      for (const seat of seatSource) {
        const seatTypeId = normalizeSeatType(seat);
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

      setPriceData({
        ticketTotal,
        serviceFee,
        discount: 0,
        grandTotal: ticketTotal + serviceFee,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tính giá. Vui lòng thử lại.';
      setPriceError(message);
      
      // Fallback to local calculation if API fails
      const ticketTotal = (selectedSeatObjects.length > 0 ? selectedSeatObjects : selectedSeats.map((seatId) => ({
        MAGHE: seatId,
        TENGHE: seatId,
        MALOAIGHE: VIP_ROWS.includes(seatId.charAt(0)) ? 'LG002' : 'LG001',
        TRANGTHAI: 'Available',
        TENLOAI: VIP_ROWS.includes(seatId.charAt(0)) ? 'VIP' : 'Standard',
      } as ApiSeat))).reduce((sum, seat) => {
        const isVip = seat.TENLOAI?.toUpperCase() === 'VIP' || seat.MALOAIGHE === 'LG002';
        return sum + (isVip ? 110000 : 85000);
      }, 0);
      const serviceFee = Math.round(ticketTotal * 0.05);
      setPriceData({
        ticketTotal,
        serviceFee,
        discount: 0,
        grandTotal: ticketTotal + serviceFee,
      });
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const handleApplyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError('Vui lòng nhập mã khuyến mãi');
      return;
    }

    setIsApplyingVoucher(true);
    setPromoError('');

    try {
      const result = await bookingAPI.applyVoucher(code, priceData.ticketTotal);
      
      if (result.valid) {
        const discount = Math.round(priceData.ticketTotal * (result.discountPercent || 0) / 100);
        setPriceData(prev => ({
          ...prev,
          discount,
          grandTotal: prev.ticketTotal + prev.serviceFee - discount,
        }));
        
        // Store applied voucher in session storage (for final checkout)
        sessionStorage.setItem('appliedVoucher', code);
      } else {
        setPromoError(result.message || 'Mã không hợp lệ hoặc đã hết hạn');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi khi áp dụng mã khuyến mãi';
      setPromoError(message);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedSuatChieu) {
      setSubmitError('Thông tin suất chiếu không hợp lệ. Vui lòng quay lại và chọn lại.');
      return;
    }

    if (!selectedSeats.length) {
      setSubmitError('Vui lòng chọn ít nhất một ghế');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const token = getToken();
      if (!token) {
        setSubmitError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        return;
      }
      // LẤY MÃ GIAO DỊCH TỪ SESSION RA 
      const pendingMaGD = sessionStorage.getItem('pendingMaGD');
      if (!pendingMaGD) {
        setSubmitError('Giao dịch đã hết hạn hoặc không tồn tại. Vui lòng quay lại chọn ghế.');
        return;
      }

      // Prepare checkout data
      const checkoutData = {
        magd: pendingMaGD,
        masuat: selectedSuatChieu.MASUAT,
        seatIds: selectedSeats,
        makhuyenmai: sessionStorage.getItem('appliedVoucher') || undefined,
        paymentMethod,
        totalAmount: priceData.grandTotal,
      };

      // Call backend checkout endpoint
      const result = await bookingAPI.checkout(checkoutData, token);

      const bookingRef = result?.MAVE || result?.transactionId || result?.bookingId;

      if (bookingRef) {
        // Save booking data to localStorage for profile view
        const bookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
        bookings.push({
          MAVE: bookingRef,
          TENPHIM: selectedMovie?.title,
          NGAYCHIEU: selectedDate,
          GIOBATDAU: selectedShowtime,
          DANHSACHGHENGOI: selectedSeats.join(', '),
          TONGTIEN: priceData.grandTotal,
          PHUONGTHUCTHANHTOAN: paymentMethod,
          THOIGIAN: new Date().toISOString(),
        });
        localStorage.setItem('myBookings', JSON.stringify(bookings));

        // Clear session storage
        sessionStorage.removeItem('appliedVoucher');
        sessionStorage.removeItem('pendingMaGD');
        
        setBookingId(bookingRef);
        setIsConfirmed(true);
      } else {
        setSubmitError(result?.message || 'Lỗi không xác định. Vui lòng thử lại.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lỗi khi xác nhận thanh toán. Vui lòng thử lại.';
      setSubmitError(message);
      console.error('[CheckoutScreen] Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (isConfirmed) {
    return (
      <div className="min-h-full bg-[#121212] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-white mb-2" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Đặt vé thành công!</h2>
          <p className="text-gray-500 mb-2">Mã vé: <span className="text-[#F5C518] font-mono">{bookingId}</span></p>
          <p className="text-gray-500 mb-6">Vé đã được gửi đến email của bạn. Hẹn gặp bạn tại rạp!</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => navigate('/profile')}
              className="bg-[#1C1C1C] border border-[#2A2A2A] text-gray-300 px-6 py-3 rounded-xl hover:bg-[#242424] transition-colors"
            >
              Xem lịch sử vé
            </button>
            <button
              onClick={() => navigate('/home')}
              className="bg-[#E50914] text-white px-6 py-3 rounded-xl hover:bg-[#C40812] transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const movie = selectedMovie;

  return (
    <div className="min-h-full bg-[#121212]">
      {/* Sub-header */}
      <div className="bg-[#0D0D0D] border-b border-[#2A2A2A] px-10 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/seat')}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Quay lại chọn ghế</span>
        </button>
        <div className="w-px h-5 bg-[#2A2A2A]" />
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">Chọn phim</span>
          <span className="text-[#E50914]">›</span>
          <span className="text-gray-500">Chọn suất chiếu</span>
          <span className="text-[#E50914]">›</span>
          <span className="text-gray-500">Chọn ghế</span>
          <span className="text-[#E50914]">›</span>
          <span className="text-white font-medium">Thanh toán</span>
        </div>
      </div>

      <div className="flex gap-8 px-10 py-8 max-w-6xl mx-auto">
        {/* LEFT COLUMN: Payment form */}
        <div className="flex-1 space-y-6">
          {/* Error alert */}
          {submitError && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{submitError}</p>
            </div>
          )}

          {/* Promo code */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#F5C518]" />
              Mã khuyến mãi
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Nhập mã khuyến mãi"
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                disabled={isApplyingVoucher}
                className="flex-1 bg-[#252525] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-[#F5C518]/50 text-sm transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleApplyPromo}
                disabled={isApplyingVoucher}
                className="bg-[#F5C518] hover:bg-[#d4a906] disabled:bg-gray-600 text-black font-semibold px-5 py-3 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                {isApplyingVoucher && <Loader className="w-4 h-4 animate-spin" />}
                Áp dụng
              </button>
            </div>
            {priceData.discount > 0 && (
              <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                <Check className="w-4 h-4" />
                Áp dụng thành công! Giảm {formatCurrency(priceData.discount)}
              </div>
            )}
            {promoError && (
              <div className="mt-3 flex items-center gap-2 text-[#E50914] text-sm">
                <AlertCircle className="w-4 h-4" />
                {promoError}
              </div>
            )}
          </div>

          {/* Payment methods */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Phương thức thanh toán</h3>
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? 'border-[#E50914] bg-[#E50914]/5'
                      : 'border-[#2A2A2A] hover:border-[#3A3A3A]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    paymentMethod === method.id ? 'border-[#E50914]' : 'border-[#444]'
                  }`}>
                    {paymentMethod === method.id && (
                      <div className="w-2.5 h-2.5 bg-[#E50914] rounded-full" />
                    )}
                  </div>
                  <span className="text-xl">{method.icon}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{method.name}</p>
                    <p className="text-gray-500 text-xs">{method.desc}</p>
                  </div>
                  {paymentMethod === method.id && (
                    <div className="ml-auto">
                      <Check className="w-4 h-4 text-[#E50914]" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Chi tiết đơn hàng</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ghế ({selectedSeats.length} vé)</span>
                <span className="text-gray-300">{isLoadingPrice || isLoadingSeats ? '...' : formatCurrency(priceData.ticketTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phí dịch vụ (5%)</span>
                <span className="text-gray-300">{isLoadingPrice || isLoadingSeats ? '...' : formatCurrency(priceData.serviceFee)}</span>
              </div>
              {priceData.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-400">Giảm giá</span>
                  <span className="text-green-400">-{formatCurrency(priceData.discount)}</span>
                </div>
              )}
              <div className="h-px bg-[#2A2A2A] my-2" />
              <div className="flex justify-between">
                <span className="text-white font-semibold">Tổng thanh toán</span>
                <span className="text-[#F5C518] font-bold text-lg">{isLoadingPrice || isLoadingSeats ? '...' : formatCurrency(priceData.grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={isSubmitting || isLoadingPrice || isLoadingSeats || !selectedSeats.length}
              className="w-full bg-[#E50914] hover:bg-[#C40812] disabled:bg-gray-600 text-white py-4 rounded-xl font-bold text-base mt-5 transition-all shadow-lg shadow-red-900/30 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Đang xử lý...' : `Xác nhận Thanh toán · ${formatCurrency(priceData.grandTotal)}`}
            </button>
            <p className="text-center text-gray-600 text-xs mt-2">
              Bằng cách thanh toán, bạn đồng ý với điều khoản dịch vụ
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Ticket preview */}
        <div className="w-80 flex-shrink-0">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[#F5C518]" />
            Xem trước vé
          </h3>

          {/* Ticket card */}
          <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden" style={{ boxShadow: '0 0 0 1px #2A2A2A, 0 20px 40px rgba(0,0,0,0.6)' }}>
            {/* Ticket header */}
            <div className="bg-gradient-to-br from-[#E50914] to-[#8B0000] p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
              <div className="relative z-10 flex items-center gap-2 mb-3">
                <Film className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-xs tracking-widest uppercase">Cinemoon</span>
              </div>
              <h2 className="text-white relative z-10 leading-tight" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {movie?.title || 'Tên phim'}
              </h2>
              <p className="text-white/70 text-xs mt-1 relative z-10">{movie?.genre}</p>
            </div>

            {/* Ticket body */}
            <div className="p-5 space-y-4">
              {/* Movie poster */}
              {movie && (
                <img src={movie.image} alt={movie.title} className="w-full h-32 object-cover rounded-lg" />
              )}

              {/* Info rows */}
              <div className="space-y-3">
                {[
                  { label: 'Rạp chiếu', value: selectedCinema, icon: <MapPin className="w-3.5 h-3.5" /> },
                  { label: 'Ngày chiếu', value: formatDateLabel(selectedDate), icon: null },
                  { label: 'Giờ chiếu', value: selectedShowtime, icon: <Clock className="w-3.5 h-3.5" /> },
                  { label: 'Số ghế', value: selectedSeats.join(', ') || '—', icon: null },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex justify-between items-start">
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      {icon}{label}
                    </span>
                    <span className="text-white text-xs font-medium text-right max-w-[160px]">{value}</span>
                  </div>
                ))}
              </div>

              {/* Dashed separator (ticket tear) */}
              <div className="relative my-4">
                <div className="border-t border-dashed border-[#333]" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-6 h-6 bg-[#121212] rounded-full" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-6 h-6 bg-[#121212] rounded-full" />
              </div>

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Tổng tiền</span>
                <span className="text-[#F5C518] font-bold">{formatCurrency(priceData.grandTotal)}</span>
              </div>

              {/* QR Code placeholder */}
              <div className="bg-white rounded-xl p-3 flex flex-col items-center gap-2">
                <div className="w-28 h-28 flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-[#121212]" />
                </div>
                <p className="text-[#121212] text-xs font-medium">Mã QR Vé điện tử</p>
                <p className="text-gray-500 text-[10px]">Xuất trình tại quầy soát vé</p>
              </div>

              {/* Booking ID */}
              <div className="bg-[#252525] rounded-lg px-4 py-3 text-center">
                <p className="text-gray-500 text-xs mb-1">Mã đặt vé</p>
                <p className="text-white font-mono font-bold tracking-widest">#CM-2025-8421</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl">
            <p className="text-gray-500 text-xs leading-relaxed">
              💡 Vé điện tử sẽ được gửi qua email sau khi thanh toán thành công. Vui lòng đến rạp trước 15 phút để soát vé.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
