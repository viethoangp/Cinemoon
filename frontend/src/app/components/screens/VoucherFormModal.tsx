import React, { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { Voucher } from '../../../services/api';

interface VoucherFormModalProps {
  voucher: Voucher | null;
  onSave: (formData: Partial<Voucher>) => void;
  onClose: () => void;
}

export const VoucherFormModal: React.FC<VoucherFormModalProps> = ({
  voucher,
  onSave,
  onClose,
}) => {
  const [tenchuongtrinh, setTenchuongtrinh] = useState(voucher?.tenchuongtrinh || '');
  const [giatrigiam, setGiatrigiam] = useState(voucher?.giatrigiam || '');
  const [dieukienapdung, setDieukienapdung] = useState(voucher?.dieukienapdung || '');
  const [ngaybatdau, setNgaybatdau] = useState(voucher?.ngaybatdau || '');
  const [ngayketthuc, setNgayketthuc] = useState(voucher?.ngayketthuc || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!tenchuongtrinh || !giatrigiam || !dieukienapdung || !ngaybatdau || !ngayketthuc) {
      setError('Vui lòng điền tất cả các trường bắt buộc.');
      return;
    }

    const start = new Date(ngaybatdau);
    const end = new Date(ngayketthuc);

    if (start >= end) {
      setError('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }

    const discountValue = parseFloat(giatrigiam.toString());
    if (isNaN(discountValue) || discountValue <= 0) {
      setError('Giá trị giảm phải là số dương.');
      return;
    }

    try {
      setLoading(true);
      onSave({
        tenchuongtrinh,
        giatrigiam: discountValue,
        dieukienapdung,
        ngaybatdau,
        ngayketthuc,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl w-full max-w-md max-h-96 overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#1A1A1A] flex items-center justify-between p-5 border-b border-[#2A2A2A]">
          <h3 className="text-white font-bold text-lg">
            {voucher ? 'Chỉnh sửa Voucher' : 'Thêm Voucher'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#252525] hover:bg-[#2A2A2A] rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {/* Tên Chương Trình */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Tên Chương Trình *</Label>
            <Input
              placeholder="Ví dụ: CINEMOON25"
              value={tenchuongtrinh}
              onChange={(e) => setTenchuongtrinh(e.target.value)}
              className="bg-[#252525] border-[#333] text-white placeholder-gray-600"
            />
          </div>

          {/* Giá Trị Giảm */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Giá Trị Giảm (VND) *</Label>
            <Input
              type="number"
              placeholder="Ví dụ: 50000"
              value={giatrigiam}
              onChange={(e) => setGiatrigiam(e.target.value)}
              className="bg-[#252525] border-[#333] text-white placeholder-gray-600"
              min="0"
            />
          </div>

          {/* Điều Kiện Áp Dụng */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Điều Kiện Áp Dụng *</Label>
            <Textarea
              placeholder="Ví dụ: Mua vé từ 2 vé trở lên"
              value={dieukienapdung}
              onChange={(e) => setDieukienapdung(e.target.value)}
              className="bg-[#252525] border-[#333] text-white placeholder-gray-600 min-h-20"
            />
          </div>

          {/* Ngày Bắt Đầu */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Ngày Bắt Đầu *</Label>
            <Input
              type="date"
              value={ngaybatdau}
              onChange={(e) => setNgaybatdau(e.target.value)}
              className="bg-[#252525] border-[#333] text-white [color-scheme:dark]" 
            />
          </div>

          {/* Ngày Kết Thúc */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Ngày Kết Thúc *</Label>
            <Input
              type="date"
              value={ngayketthuc}
              onChange={(e) => setNgayketthuc(e.target.value)}
              className="bg-[#252525] border-[#333] text-white [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#1A1A1A] flex gap-3 p-5 border-t border-[#2A2A2A]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#252525] hover:bg-[#2A2A2A] text-gray-300 rounded-lg font-medium transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-[#E50914] hover:bg-[#C40812] disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};
