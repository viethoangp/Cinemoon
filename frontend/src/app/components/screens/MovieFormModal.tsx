import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { Movie, Genre } from '../../../services/api';

interface MovieFormModalProps {
  movie: Movie | null;
  genres: Genre[];
  onSave: (data: Partial<Movie>) => Promise<void>;
  onClose: () => void;
}

export const MovieFormModal = ({ movie, genres, onSave, onClose }: MovieFormModalProps) => {
  const [formData, setFormData] = useState<Partial<Movie>>({
    tenphim: '',
    thoigianphim: 90,
    daiPhim: '',
    directorName: '',
    poster: '',
    mota: '',
    dacdiem: '',
    ngayPhatHanhThuyetMinh: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (movie) {
      setFormData(movie);
    }
  }, [movie]);

  const handleChange = (field: keyof Movie, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenphim?.trim() || !formData.thoigianphim) {
      alert('Vui lòng điền đủ thông tin bắt buộc (Tên phim, Thời lượng)');
      return;
    }
    try {
      setSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Lỗi lưu phim:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5 sticky top-0">
          <h3 className="text-white font-bold text-lg">
            {movie ? 'Sửa thông tin phim' : 'Thêm phim mới'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-[#252525] rounded-full flex items-center justify-center hover:bg-[#333] transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên phim - Bắt buộc */}
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">
              Tên phim <span className="text-[#E50914]">*</span>
            </label>
            <input
              type="text"
              value={formData.tenphim || ''}
              onChange={(e) => handleChange('tenphim', e.target.value)}
              placeholder="Nhập tên phim..."
              className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 outline-none focus:border-[#E50914]/50 text-sm transition-colors"
              required
            />
          </div>

          {/* Thời lượng - Bắt buộc */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">
                Thời lượng (phút) <span className="text-[#E50914]">*</span>
              </label>
              <input
                type="number"
                value={formData.thoigianphim || 90}
                onChange={(e) => handleChange('thoigianphim', parseInt(e.target.value) || 90)}
                min="1"
                className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#E50914]/50 text-sm transition-colors"
                required
              />
            </div>

            {/* Đạo diễn */}
            <div>
              <label className="text-gray-400 text-sm mb-1.5 block">Đạo diễn</label>
              <input
                type="text"
                value={formData.directorName || ''}
                onChange={(e) => handleChange('directorName', e.target.value)}
                placeholder="Tên đạo diễn"
                className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 outline-none focus:border-[#E50914]/50 text-sm transition-colors"
              />
            </div>
          </div>

          {/* Thể loại */}
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Thể loại</label>
            <select
              value={formData.daiPhim || ''}
              onChange={(e) => handleChange('daiPhim', e.target.value)}
              className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#E50914]/50 text-sm transition-colors"
            >
              <option value="">Chọn thể loại</option>
              {genres.map((genre) => (
                <option key={genre.madai} value={genre.madai}>
                  {genre.tendai}
                </option>
              ))}
            </select>
          </div>

          {/* Ngày phát hành */}
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Ngày phát hành thuyết minh</label>
            <input
              type="date"
              value={formData.ngayPhatHanhThuyetMinh || ''}
              onChange={(e) => handleChange('ngayPhatHanhThuyetMinh', e.target.value)}
              className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-2.5 text-white outline-none focus:border-[#E50914]/50 text-sm transition-colors"
            />
          </div>

          {/* URL Poster */}
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">URL Poster</label>
            <input
              type="text"
              value={formData.poster || ''}
              onChange={(e) => handleChange('poster', e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 outline-none focus:border-[#E50914]/50 text-sm transition-colors"
            />
            {formData.poster && (
              <div className="mt-2 flex gap-2">
                <img
                  src={formData.poster}
                  alt="Preview"
                  className="h-20 w-14 object-cover rounded border border-[#333]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Mô tả</label>
            <textarea
              value={formData.mota || ''}
              onChange={(e) => handleChange('mota', e.target.value)}
              placeholder="Nhập mô tả phim..."
              rows={3}
              className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 outline-none focus:border-[#E50914]/50 text-sm transition-colors resize-none"
            />
          </div>

          {/* Đặc điểm */}
          <div>
            <label className="text-gray-400 text-sm mb-1.5 block">Đặc điểm</label>
            <input
              type="text"
              value={formData.dacdiem || ''}
              onChange={(e) => handleChange('dacdiem', e.target.value)}
              placeholder="VD: 2D, 3D, IMAX..."
              className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 outline-none focus:border-[#E50914]/50 text-sm transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-[#2A2A2A]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#252525] border border-[#333] text-gray-300 rounded-xl text-sm hover:bg-[#2A2A2A] transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-[#E50914] text-white rounded-xl text-sm font-semibold hover:bg-[#C40812] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Đang lưu...' : movie ? 'Cập nhật' : 'Thêm phim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
