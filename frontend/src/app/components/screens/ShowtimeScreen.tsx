import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, Clock, Star, MapPin, Users } from 'lucide-react';
import { MOVIES, useApp } from '../../context/AppContext';

const CINEMAS = [
  'Cinemoon Hà Nội - Mipec',
  'Cinemoon HN - Vincom Bà Triệu',
  'Cinemoon HN - Royal City',
  'Cinemoon HCM - Bitexco',
  'Cinemoon HCM - Landmark 81',
  'Cinemoon Đà Nẵng - Center',
];

const SHOWTIMES_BY_MOVIE: Record<number, string[][]> = {
  1: [['09:00', '11:30', '14:00'], ['16:20', '19:00', '21:30']],
  2: [['10:15', '13:00'], ['15:45', '18:30', '21:00', '23:15']],
  3: [['11:00', '14:30', '17:00'], ['19:30', '22:00']],
  4: [['09:30', '12:00', '14:30'], ['17:00', '19:30', '22:00']],
  5: [['10:00', '13:15'], ['16:00', '19:00', '21:45']],
  6: [['11:30', '14:00', '16:30'], ['19:00', '21:30']],
};

const HALL_TYPES: Record<number, string[]> = {
  1: ['2D', '3D IMAX', '4DX'],
  2: ['2D', '3D'],
  3: ['2D', '3D Dolby'],
  4: ['2D'],
  5: ['2D', '3D IMAX', '4DX Premium'],
  6: ['2D', 'Dolby Atmos'],
};

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

export const ShowtimeScreen = () => {
  const navigate = useNavigate();
  const { selectedMovie, setSelectedMovie, setSelectedShowtime, setSelectedDate, setSelectedCinema, selectedCinema } = useApp();
  const dates = getDates();
  const [activeDate, setActiveDate] = useState(dates[0].iso);
  const [activeCinema, setActiveCinema] = useState(selectedCinema);
  const [showCinemaDropdown, setShowCinemaDropdown] = useState(false);

  const handleSelectShowtime = (movie: typeof MOVIES[0], time: string) => {
    setSelectedMovie(movie);
    setSelectedShowtime(time);
    setSelectedDate(activeDate);
    setSelectedCinema(activeCinema);
    navigate('/seat');
  };

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
                <span className="text-white text-sm">{activeCinema}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCinemaDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showCinemaDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-xl z-20">
                {CINEMAS.map((cinema) => (
                  <button
                    key={cinema}
                    onClick={() => { setActiveCinema(cinema); setShowCinemaDropdown(false); }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      activeCinema === cinema
                        ? 'bg-[#E50914]/10 text-[#E50914]'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {cinema}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Movie showtime list */}
      <div className="px-10 py-6 space-y-4">
        {MOVIES.map((movie) => {
          const times = SHOWTIMES_BY_MOVIE[movie.id] || [[], []];
          const hallTypes = HALL_TYPES[movie.id] || ['2D'];

          return (
            <div key={movie.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#333] transition-colors">
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
                      {hallTypes.map(ht => (
                        <span key={ht} className="text-xs px-2 py-1 bg-[#252525] border border-[#333] rounded text-gray-400">
                          {ht}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes rows */}
                  {times.map((row, rowIdx) => (
                    <div key={rowIdx} className={`flex items-center gap-3 ${rowIdx < times.length - 1 ? 'mb-3 pb-3 border-b border-[#252525]' : ''}`}>
                      <div className="flex items-center gap-1.5 text-gray-600 text-xs w-20 flex-shrink-0">
                        <Users className="w-3.5 h-3.5" />
                        <span>{rowIdx === 0 ? 'Sáng/Trưa' : 'Chiều/Tối'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {row.map((time) => {
                          const isHighDemand = ['19:00', '19:30', '21:00', '21:30'].includes(time);
                          return (
                            <button
                              key={time}
                              onClick={() => handleSelectShowtime(movie, time)}
                              className={`group px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                isHighDemand
                                  ? 'border-[#F5C518]/40 bg-[#F5C518]/5 text-[#F5C518] hover:bg-[#F5C518]/20'
                                  : 'border-[#2A2A2A] bg-[#252525] text-gray-300 hover:border-[#E50914]/50 hover:bg-[#E50914]/10 hover:text-white'
                              }`}
                            >
                              {time}
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
        })}
      </div>
    </div>
  );
};
