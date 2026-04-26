import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Star, Clock, Play, X, ChevronRight, TrendingUp, Flame, Award, Calendar } from 'lucide-react';
import { MOVIES, Movie, useApp } from '../../context/AppContext';

const HERO_URL = "https://images.unsplash.com/photo-1759230766134-e3ff1c27d20e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

const RATING_COLORS: Record<string, string> = {
  'P': 'bg-green-600',
  'T13': 'bg-blue-600',
  'T16': 'bg-orange-500',
  'T18': 'bg-[#E50914]',
};

const formatCurrency = (n: number) =>
  n.toLocaleString('vi-VN') + 'đ';

interface MovieDetailModalProps {
  movie: Movie;
  onClose: () => void;
  onBook: () => void;
}

const MovieDetailModal = ({ movie, onClose, onBook }: MovieDetailModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      {/* Modal */}
      <div className="relative bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl">
        {/* Hero image */}
        <div className="relative h-60 overflow-hidden">
          <img src={movie.image} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          {/* Rating badge */}
          <span className={`absolute top-4 left-4 ${RATING_COLORS[movie.rating] || 'bg-gray-600'} text-white text-xs px-2 py-1 rounded-md font-bold`}>
            {movie.rating}
          </span>

          {/* Play button */}
          <button className="absolute inset-0 flex items-center justify-center group">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center group-hover:bg-[#E50914]/80 transition-all">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-white mb-1" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{movie.title}</h2>
              <p className="text-gray-500 text-sm">{movie.genre} · {movie.year}</p>
            </div>
            <div className="flex items-center gap-1 bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-lg px-3 py-1.5">
              <Star className="w-4 h-4 text-[#F5C518] fill-[#F5C518]" />
              <span className="text-[#F5C518] font-bold text-sm">{movie.score}</span>
            </div>
          </div>

          {/* Info pills */}
          <div className="flex gap-3 mb-4">
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              {movie.duration}
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <span className="text-gray-600">Đạo diễn:</span>
              <span className="text-gray-300">{movie.director}</span>
            </div>
          </div>

          {/* Cast */}
          <div className="mb-4">
            <span className="text-gray-600 text-sm">Diễn viên: </span>
            <span className="text-gray-300 text-sm">{movie.cast.join(', ')}</span>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed mb-6">{movie.description}</p>

          {/* Price & Book button */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Giá vé từ</p>
              <p className="text-[#F5C518] font-bold text-lg">{formatCurrency(movie.price)}</p>
            </div>
            <button
              onClick={onBook}
              className="flex items-center gap-2 bg-[#E50914] hover:bg-[#C40812] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-red-900/30"
            >
              Chọn Suất Chiếu
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MovieCard = ({ movie, onClick }: { movie: Movie; onClick: () => void }) => {
  const navigate = useNavigate();
  const { setSelectedMovie } = useApp();

  return (
    <div className="group bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#E50914]/50 transition-all hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-1 cursor-pointer">
      {/* Poster */}
      <div className="relative h-64 overflow-hidden" onClick={onClick}>
        <img
          src={movie.image}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`${RATING_COLORS[movie.rating] || 'bg-gray-600'} text-white text-xs px-2 py-0.5 rounded font-bold`}>
            {movie.rating}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="w-3 h-3 text-[#F5C518] fill-[#F5C518]" />
          <span className="text-white text-xs font-medium">{movie.score}</span>
        </div>
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-[#E50914]/90 rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm mb-1 truncate">{movie.title}</h3>
        <p className="text-gray-500 text-xs mb-3">{movie.genre}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Clock className="w-3 h-3" />
            {movie.duration}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMovie(movie);
              navigate('/showtime');
            }}
            className="bg-[#E50914]/10 hover:bg-[#E50914] text-[#E50914] hover:text-white border border-[#E50914]/30 hover:border-[#E50914] text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
          >
            Đặt vé
          </button>
        </div>
      </div>
    </div>
  );
};

export const HomeScreen = () => {
  const navigate = useNavigate();
  const { setSelectedMovie } = useApp();
  const [modalMovie, setModalMovie] = useState<Movie | null>(null);

  const featuredMovie = MOVIES[4]; // Rừng Thiêng as featured

  const handleCardClick = (movie: Movie) => setModalMovie(movie);
  const handleBook = () => {
    if (modalMovie) {
      setSelectedMovie(modalMovie);
      navigate('/showtime');
    }
  };

  return (
    <div className="min-h-full bg-[#121212]">
      {/* HERO BANNER */}
      <div className="relative h-[380px] overflow-hidden">
        <img
          src={featuredMovie.image}
          alt={featuredMovie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center px-12">
          <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-[#E50914]" />
              <span className="text-[#E50914] text-sm font-semibold uppercase tracking-wider">Phim nổi bật</span>
            </div>
            <h1 className="text-white mb-2" style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1 }}>
              {featuredMovie.title}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-[#F5C518] fill-[#F5C518]" />
                <span className="text-[#F5C518] font-bold text-sm">{featuredMovie.score}</span>
              </div>
              <span className="text-gray-400 text-sm">{featuredMovie.duration}</span>
              <span className="text-gray-400 text-sm">{featuredMovie.genre}</span>
              <span className={`${RATING_COLORS[featuredMovie.rating]} text-white text-xs px-2 py-0.5 rounded font-bold`}>
                {featuredMovie.rating}
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
              {featuredMovie.description}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedMovie(featuredMovie); navigate('/showtime'); }}
                className="flex items-center gap-2 bg-[#E50914] hover:bg-[#C40812] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-red-900/40"
              >
                <Flame className="w-4 h-4" />
                Đặt vé ngay
              </button>
              <button
                onClick={() => setModalMovie(featuredMovie)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all backdrop-blur-sm"
              >
                <Play className="w-4 h-4" />
                Xem trailer
              </button>
            </div>
          </div>
        </div>

        {/* Right side mini-posters */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex gap-3 opacity-60">
          {MOVIES.slice(0, 3).map((m, i) => (
            <div key={m.id} className="w-24 h-36 rounded-lg overflow-hidden border border-white/10" style={{ opacity: 1 - i * 0.25 }}>
              <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="px-12 py-8">
        {/* Filter tabs */}
        <div className="flex items-center gap-6 mb-8">
          <div className="flex gap-2">
            {[
              { label: 'Đang chiếu', icon: <TrendingUp className="w-4 h-4" />, active: true },
              { label: 'Sắp chiếu', icon: <Calendar className="w-4 h-4" />, active: false },
              { label: 'Phim hot', icon: <Flame className="w-4 h-4" />, active: false },
              { label: 'Giải thưởng', icon: <Award className="w-4 h-4" />, active: false },
            ].map(tab => (
              <button
                key={tab.label}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                  tab.active
                    ? 'bg-[#E50914] text-white'
                    : 'bg-[#1C1C1C] text-gray-400 hover:text-white hover:bg-[#242424]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 text-gray-500 text-sm">
            <span>Sắp xếp:</span>
            <select className="bg-[#1C1C1C] border border-[#2A2A2A] text-gray-300 text-sm rounded-lg px-3 py-1.5 outline-none">
              <option>Phổ biến nhất</option>
              <option>Điểm cao nhất</option>
              <option>Mới nhất</option>
            </select>
          </div>
        </div>

        {/* Section title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            Phim đang chiếu
          </h2>
          <button className="flex items-center gap-1 text-[#E50914] text-sm hover:text-[#ff1a1a] transition-colors">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-6 gap-4">
          {MOVIES.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onClick={() => handleCardClick(movie)} />
          ))}
        </div>

        {/* Coming soon section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Sắp ra mắt
            </h2>
            <button className="flex items-center gap-1 text-[#E50914] text-sm hover:text-[#ff1a1a] transition-colors">
              Xem thêm <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {MOVIES.slice(0, 3).map((movie) => (
              <div key={`cs-${movie.id}`} className="flex gap-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 hover:border-[#333] transition-colors">
                <img src={movie.image} alt={movie.title} className="w-16 h-24 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-semibold mb-1 truncate">{movie.title}</h4>
                  <p className="text-gray-500 text-xs mb-2">{movie.genre}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-3 h-3 text-[#F5C518] fill-[#F5C518]" />
                    <span className="text-gray-400 text-xs">{movie.score}</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-[#252525] px-2 py-1 rounded-md">Khởi chiếu 01/05</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Movie Detail Modal */}
      {modalMovie && (
        <MovieDetailModal
          movie={modalMovie}
          onClose={() => setModalMovie(null)}
          onBook={handleBook}
        />
      )}
    </div>
  );
};
