import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { catalogAPI } from '../../../services/api';

interface Promotion {
  MAKHUYENMAI?: string;
  TENCHUONGTRINH?: string;
  GIATRIGIAM?: number;
  DIEUKIENAPDUNG?: number;
  NGAYBATDAU?: string;
  NGAYKETTHUC?: string;
}

export const PromotionsScreen = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await catalogAPI.getPromotions();
        setPromotions(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải danh sách khuyến mãi';
        setError(message);
        console.error('[PromotionsScreen]', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const formatCurrency = (value?: number) => {
    if (!value) return '0đ';
    return value.toLocaleString('vi-VN') + 'đ';
  };

  const formatCondition = (condition?: number) => {
    if (!condition) return 'Không có điều kiện';
    return `Đơn tối thiểu: ${formatCurrency(condition)}`;
  };

  return (
    <div className="min-h-full bg-[#121212] px-12 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-white text-4xl font-bold mb-3">Khuyến Mãi</h1>
        <p className="text-gray-400 text-lg">Khám phá những ưu đãi hấp dẫn và tiết kiệm hơn khi xem phim tại Cinemoon</p>
      </div>

      {/* Alert banner */}
      <div className="mb-8 bg-[#E50914]/10 border border-[#E50914]/50 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-[#E50914] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-white font-semibold mb-1">Lưu ý!</p>
          <p className="text-gray-300 text-sm">Vui lòng kiểm tra điều kiện áp dụng khi đặt vé.</p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-8 bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-semibold">Lỗi tải dữ liệu</p>
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader className="w-8 h-8 text-[#E50914] animate-spin" />
        </div>
      )}

      {/* Promotions Grid */}
      {!loading && promotions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {promotions.map((promo, index) => (
            <div
              key={promo.MAKHUYENMAI || index}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 hover:border-[#E50914]/50 transition-all hover:shadow-xl hover:shadow-red-900/10"
            >
              {/* Discount badge */}
              <div className="flex items-start justify-between mb-4">
                <div></div>
                <div className="bg-[#E50914] text-white px-3 py-1 rounded-lg text-sm font-bold">
                  {formatCurrency(promo.GIATRIGIAM)}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-white text-lg font-bold mb-2">{promo.TENCHUONGTRINH || 'Khuyến mãi'}</h3>

              {/* Condition */}
              <p className="text-gray-400 text-sm mb-4">{formatCondition(promo.DIEUKIENAPDUNG)}</p>

              {/* Valid until */}
              <div className="pt-4 border-t border-[#2A2A2A] flex items-center justify-between">
                <span className="text-gray-500 text-xs">Hạn sử dụng:</span>
                <span className="text-[#F5C518] font-semibold text-sm">
                  {promo.NGAYKETTHUC ? new Date(promo.NGAYKETTHUC).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && promotions.length === 0 && !error && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Hiện không có khuyến mãi nào</p>
        </div>
      )}

      {/* Additional info section */}
      <div className="mt-12 bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8">
        <h2 className="text-white text-2xl font-bold mb-4">Cách sử dụng khuyến mãi</h2>
        <div className="space-y-3 text-gray-400 text-sm">
          <p>
            <span className="text-[#E50914] font-semibold">1. Chọn phim:</span> Duyệt danh sách phim đang chiếu hoặc sắp ra mắt.
          </p>
          <p>
            <span className="text-[#E50914] font-semibold">2. Chọn suất chiếu:</span> Lựa chọn rạp, ngày giờ phù hợp với bạn.
          </p>
          <p>
            <span className="text-[#E50914] font-semibold">3. Chọn ghế:</span> Tìm chọn vị trí ghế thoải mái.
          </p>
          <p>
            <span className="text-[#E50914] font-semibold">4. Thanh toán:</span> Chọn mã giảm giá/khuyến mãi áp dụng trước khi thanh toán.
          </p>
          <p>
            <span className="text-[#E50914] font-semibold">5. Nhận vé:</span> Vé sẽ gửi tới email hoặc điện thoại của bạn.
          </p>
        </div>
      </div>
    </div>
  );
};
