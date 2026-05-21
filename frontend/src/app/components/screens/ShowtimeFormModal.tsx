import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Showtime, Room, MovieDropdown } from '../../../services/api';

interface ShowtimeFormModalProps {
  showtime: Showtime | null;
  rooms: Room[];
  movies: MovieDropdown[];
  onSave: (formData: Partial<Showtime>) => void;
  onClose: () => void;
}

export const ShowtimeFormModal: React.FC<ShowtimeFormModalProps> = ({
  showtime,
  rooms,
  movies,
  onSave,
  onClose,
}) => {
  const [maphim, setMaphim] = useState(showtime?.maphim || '');
  const [maphong, setMaphong] = useState(showtime?.maphong || '');
  const [ngaychieu, setNgaychieu] = useState(showtime?.ngaychieu || '');
  const [giobatdau, setGiobatdau] = useState(showtime?.giobatdau || '');
  const [gioketthuc, setGioketthuc] = useState(showtime?.gioketthuc || '');
  const [trangthaisuat, setTrangthaisuat] = useState(showtime?.trangthaisuat || 'Upcoming');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!maphim || !maphong || !ngaychieu || !giobatdau || !gioketthuc) {
      setError('Vui lòng điền tất cả các trường bắt buộc.');
      return;
    }

    const startTime = new Date(`${ngaychieu}T${giobatdau}`);
    const endTime = new Date(`${ngaychieu}T${gioketthuc}`);

    if (startTime >= endTime) {
      setError('Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }

    try {
      setLoading(true);
      onSave({
        maphim,
        maphong,
        ngaychieu,
        giobatdau,
        gioketthuc,
        trangthaisuat,
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
            {showtime ? 'Chỉnh sửa Suất chiếu' : 'Thêm Suất chiếu'}
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

          {/* Phim Dropdown */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Phim *</Label>
            <Select value={maphim} onValueChange={setMaphim}>
              <SelectTrigger className="bg-[#252525] border-[#333] text-white">
                <SelectValue placeholder="Chọn phim" />
              </SelectTrigger>
              <SelectContent className="bg-[#252525] border-[#333]">
                {movies.map((movie) => (
                  <SelectItem key={movie.maphim} value={movie.maphim} className="text-white">
                    {movie.tenphim} ({movie.thoiluong} phút)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phòng Dropdown */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Phòng chiếu *</Label>
            <Select value={maphong} onValueChange={setMaphong}>
              <SelectTrigger className="bg-[#252525] border-[#333] text-white">
                <SelectValue placeholder="Chọn phòng" />
              </SelectTrigger>
              <SelectContent className="bg-[#252525] border-[#333]">
                {rooms.map((room) => (
                  <SelectItem key={room.maphong} value={room.maphong} className="text-white">
                    {room.tenrap} - {room.succhuaghe} ghế
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ngày chiếu */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Ngày chiếu *</Label>
            <Input
              type="date"
              value={ngaychieu}
              onChange={(e) => setNgaychieu(e.target.value)}
              className="bg-[#252525] border-[#333] text-white [color-scheme:dark]"
            />
          </div>

          {/* Giờ bắt đầu */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Giờ bắt đầu *</Label>
            <Input
              type="time"
              value={giobatdau}
              onChange={(e) => setGiobatdau(e.target.value)}
              className="bg-[#252525] border-[#333] text-white [color-scheme:dark]"
            />
          </div>

          {/* Giờ kết thúc */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Giờ kết thúc *</Label>
            <Input
              type="time"
              value={gioketthuc}
              onChange={(e) => setGioketthuc(e.target.value)}
              className="bg-[#252525] border-[#333] text-white [color-scheme:dark]"
            />
          </div>

          {/* Trạng thái */}
          <div>
            <Label className="text-gray-300 text-sm mb-2 block">Trạng thái</Label>
            <Select value={trangthaisuat} onValueChange={setTrangthaisuat}>
              <SelectTrigger className="bg-[#252525] border-[#333] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#252525] border-[#333]">
                <SelectItem value="Upcoming" className="text-white">Sắp chiếu</SelectItem>
                <SelectItem value="Active" className="text-white">Đang chiếu</SelectItem>
                <SelectItem value="Completed" className="text-white">Hoàn thành</SelectItem>
                <SelectItem value="Cancelled" className="text-white">Hủy</SelectItem>
              </SelectContent>
            </Select>
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
