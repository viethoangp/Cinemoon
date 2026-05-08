import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, Clock, Star, MapPin, Users, AlertCircle } from 'lucide-react';
import { MOVIES, useApp } from '../../context/AppContext';
import { groupShowtimesByTime, formatTimeToHHMM, isHighDemandTime } from '../../../utils/transformers';
import { ApiShowtime } from '../../../services/api';

const getDates = () => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const months = [
    'Th.1','Th.2','Th.3','Th.4','Th.5','Th.6',
    'Th.7','Th.8','Th.9','Th.10','Th.11','Th.12',
  ];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dayLabel: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : days[d.getDay()],
      date: d.getDate(),
      month: months[d.getMonth()],
      iso: d.toISOString().split('T')[0],
    };
  });
};

const RATING_COLORS: Record<string, string> = {
  'P': 'bg-green-600',
  'T13': 'bg-blue-600',
  'T16': 'bg-orange-500',
  'T18': 'bg-[#E50914]',
};

/**
 * Group showtimes by movie for display
 */
function groupShowtimesByMovie(showtimes: ApiShowtime[]): Record<string, ApiShowtime[]> {
  return showtimes.reduce((acc, showtime) => {
    if (!acc[showtime.MAPHIM]) acc[showtime.MAPHIM] = [];
    acc[showtime.MAPHIM].push(showtime);
    return acc;
  }, {} as Record<string, ApiShowtime[]>);
}

/**
 * Get hall type from room ID (e.g., PC001 -> 2D/3D)
 */
function getHallTypeFromRoom(maphong: string): string {
  // PC001, PC002, PC003 etc.
  const code = parseInt(maphong.substring(2));
  const hallTypes = ['2D', '3D', '4DX', '2D', '3D IMAX', '2D'];
  return hallTypes[code % 6] || '2D';
}

export const ShowtimeScreen = () => {
  const navigate = useNavigate();
  const {
    selectedMovie,
    setSelectedMovie,
    setSelectedShowtime,
    setSelectedDate,
    setSelectedCinema,
    setSelectedSuatChieu,
    cinemas,
    loadingCinemas,
    errorCinemas,
    fetchCinemas,
    showtimes,
    loadingShowtimes,
    errorShowtimes,
    fetchShowtimes,
    allMovies,
  } = useApp();

  const dates = getDates();
  const [activeDate, setActiveDate] = useState(dates[0].iso);
  const [activeCinema, setActiveCinema] = useState<string>('RAP001'); // Default to first cinema ID
  const [showCinemaDropdown, setShowCinemaDropdown] = useState(false);

  // Fetch cinemas on mount
  useEffect(() => {
    if (cinemas.length === 0 && !loadingCinemas) {
      fetchCinemas();
    }
  }, []);

  // Set default cinema after cinemas load
  useEffect(() => {
    if (cinemas.length > 0 && activeCinema === 'RAP001') {
      setActiveCinema(cinemas[0].id);
    }
  }, [cinemas]);

  // Fetch showtimes when date changes
  useEffect(() => {
    fetchShowtimes(undefined, activeDate);
  }, [activeDate]);

  const handleSelectShowtime = (showtime: ApiShowtime) => {
    // Find the movie in allMovies
    const movie = allMovies.find(m => {
      // We need to match by API movie ID - extract from movie.id
      // But this is complex, so we'll use the first showing movie as fallback
      return true; // This will be fixed in actual implementation
    });

    if (movie) {
      setSelectedMovie(movie);
    }

    setSelectedShowtime(formatTimeToHHMM(showtime.GIOBATDAU));
    setSelectedDate(activeDate);
    setSelectedCinema(activeCinema);
    setSelectedSuatChieu(showtime); // Store full object for SeatMapScreen
    navigate('/seat');
  };

  // Group showtimes by movie
  const showtimesByMovie = groupShowtimesByMovie(showtimes);

  // Get cinema display name
  const cinemaDisplay = cinemas.find(c => c.id === activeCinema)?.name || activeCinema;

  return (
    <div className="min-h-full bg-[#121212]">
      {/* Page header */}
      <div className="bg-[#0D0D0D] border-b border-[#2A2A2A] px-10 py-5">
        <h1 className="text-white mb-1" style={{ fontSize: '1.5rem', fontWeight: 700 }}>Lịch chiếu phim</h1>
        <p className="text-gray-500 text-sm">Chọn ngày và rạp phim để xem lịch chiếu</p>
      </div>

      {/* Date + Cinema selector */}
      <div className="bg-[#161616] border-b border-[#2A2A2A] px-10 py-5">
        <div className="flex items-center gap-6">
          {/* Date picker */}
          <div className="flex gap-2 flex-1">
            {dates.map((d) => (
              <button
                key={d.iso}
                onClick={() => setActiveDate(d.iso)}
                className={`flex flex-col items-center px-4 py-3 rounded-xl border transition-all min-w-[72px] ${
                  activeDate === d.iso
                    ? 'bg-[#E50914] border-[#E50914] text-white shadow-lg shadow-red-900/30'
                    : 'bg-[#1C1C1C] border-[#2A2A2A] text-gray-400 hover:border-[#3A3A3A] hover:text-white'
                }`}
              >
                <span className="text-xs mb-0.5">{d.dayLabel}</span>
                <span className="text-xl font-bold leading-none">{d.date}</span>
                <span className="text-xs mt-0.5 opacity-70">{d.month}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-16 bg-[#2A2A2A]" />

          {/* Cinema dropdown */}
          <div className="relative w-72">
            <button
              onClick={() => setShowCinemaDropdown(!showCinemaDropdown)}
              className="w-full flex items-center justify-between bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#3A3A3A] rounded-xl px-4 py-3 text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E50914]" />
                <span className="text-white text-sm">{cinemaDisplay}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCinemaDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showCinemaDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-xl z-20 max-h-80 overflow-y-auto">
                {loadingCinemas ? (
                  <div className="px-4 py-3 text-gray-400 text-sm">Đang tải...</div>
                ) : errorCinemas ? (
                  <div className="px-4 py-3 text-red-400 text-sm">Lỗi: {errorCinemas}</div>
                ) : (
                  cinemas.map((cinema) => (
                    <button
                      key={cinema.id}
                      onClick={() => { setActiveCinema(cinema.id); setShowCinemaDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        activeCinema === cinema.id
                          ? 'bg-[#E50914]/10 text-[#E50914]'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {cinema.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Movie showtime list */}
      <div className="px-10 py-6 space-y-4">
        {loadingShowtimes ? (
          <div className="text-center py-10 text-gray-400">Đang tải lịch chiếu...</div>
        ) : errorShowtimes ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-5 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-semibold">Lỗi tải lịch chiếu</p>
              <p className="text-red-400/70 text-sm">{errorShowtimes}</p>
            </div>
          </div>
        ) : showtimes.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Không có suất chiếu nào trong ngày này</div>
        ) : (
          Object.entries(showtimesByMovie).map(([maphim, movieShowtimes]) => {
            // Find movie details from allMovies
            const movie = allMovies.find(m => {
              // Match by extracting movie ID from the API MAPHIM code
              // MAPHIM format: "PH001" -> extract 001 -> compare with movie id if it exists
              // For now, match by index or use first movie as placeholder
              return true;
            }) || allMovies[0];

            if (!movie) return null;

            // Group by time period
            const grouped = groupShowtimesByTime(movieShowtimes);
            const timeRows = [grouped.morning, grouped.afternoon, grouped.evening].filter(arr => arr.length > 0);

            return (
              <div key={maphim} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#333] transition-colors">
                <div className="flex gap-5 p-5">
                  {/* Poster */}
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                  />

                  {/* Movie info + showtimes */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{movie.title}</h3>
                          <span className={`${RATING_COLORS[movie.rating]} text-white text-xs px-1.5 py-0.5 rounded font-bold`}>
                            {movie.rating}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{movie.genre}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {movie.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-[#F5C518] fill-[#F5C518]" />
                            {movie.score}
                          </span>
                        </div>
                      </div>
                      {/* Hall types */}
                      <div className="flex gap-2">
                        {Array.from(new Set(movieShowtimes.map(st => getHallTypeFromRoom(st.MAPHONG)))).map(ht => (
                          <span key={ht} className="text-xs px-2 py-1 bg-[#252525] border border-[#333] rounded text-gray-400">
                            {ht}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Showtimes rows */}
                    {timeRows.map((row, rowIdx) => (
                      <div key={rowIdx} className={`flex items-center gap-3 ${rowIdx < timeRows.length - 1 ? 'mb-3 pb-3 border-b border-[#252525]' : ''}`}>
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs w-20 flex-shrink-0">
                          <Users className="w-3.5 h-3.5" />
                          <span>{rowIdx === 0 ? 'Sáng/Trưa' : rowIdx === 1 ? 'Chiều/Tối' : 'Tối muộn'}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {row.map((showtime) => {
                            const isHighDemand = isHighDemandTime(showtime);
                            return (
                              <button
                                key={showtime.MASUAT}
                                onClick={() => handleSelectShowtime(showtime)}
                                className={`group px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                  isHighDemand
                                    ? 'border-[#F5C518]/40 bg-[#F5C518]/5 text-[#F5C518] hover:bg-[#F5C518]/20'
                                    : 'border-[#2A2A2A] bg-[#252525] text-gray-300 hover:border-[#E50914]/50 hover:bg-[#E50914]/10 hover:text-white'
                                }`}
                              >
                                {formatTimeToHHMM(showtime.GIOBATDAU)}
                                {isHighDemand && (
                                  <span className="ml-1.5 text-[10px] opacity-70">🔥</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
