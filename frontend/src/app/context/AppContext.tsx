import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { catalogAPI, authAPI, ApiMovie, ApiShowtime, ApiCinema } from '../../services/api';
import { transformMoviesFromAPI, filterMoviesByStatus, mapCinemaData } from '../../utils/transformers';
import { saveToken, getToken, saveUser, getUser, clearToken, clearUser, User as TokenUser, logout as tokenLogout } from '../../utils/token';

export interface Movie {
  id: number;
  maphim: string; // Keep original API ID for matching
  title: string;
  genre: string;
  duration: string;
  rating: string;
  image: string;
  score: number;
  description: string;
  price: number;
  year: number;
  director: string;
  cast: string[];
}

interface AppContextType {
  // Movie selection
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;
  
  // Booking selection
  selectedSeats: string[];
  setSelectedSeats: (seats: string[]) => void;
  toggleSeat: (seatId: string) => void;
  clearSelectedSeats: () => void;
  selectedShowtime: string;
  setSelectedShowtime: (showtime: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedCinema: string;
  setSelectedCinema: (cinema: string) => void;
  selectedSuatChieu: ApiShowtime | null;
  setSelectedSuatChieu: (suatChieu: ApiShowtime | null) => void;
  
  // Movie API data
  allMovies: Movie[];
  showingMovies: Movie[];
  upcomingMovies: Movie[];
  loadingMovies: boolean;
  errorMovies: string | null;
  fetchMovies: () => Promise<void>;
  
  // Showtime API data
  showtimes: ApiShowtime[];
  loadingShowtimes: boolean;
  errorShowtimes: string | null;
  fetchShowtimes: (maphim?: string, ngaychieu?: string, marap?: string) => Promise<void>;
  
  // Cinema API data
  cinemas: { id: string; name: string; address: string }[];
  loadingCinemas: boolean;
  errorCinemas: string | null;
  fetchCinemas: () => Promise<void>;
  
  // Auth state
  user: TokenUser | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;

  
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const MOVIES: Movie[] = [
  {
    id: 1,
    maphim: "PHIM001",
    title: "Vũ Trụ Song Song",
    genre: "Khoa học viễn tưởng",
    duration: "148 phút",
    rating: "T13",
    image: "https://images.unsplash.com/photo-1628026553588-3af8f47d4d10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    score: 8.4,
    description: "Cuộc hành trình xuyên không gian và thời gian của một nhà khoa học trẻ nhằm cứu vũ trụ khỏi sự sụp đổ không thể đảo ngược. Khi các chiều không gian giao thoa, ranh giới giữa thực tại và ảo tưởng dần tan biến.",
    price: 90000,
    year: 2025,
    director: "Nguyễn Minh Khoa",
    cast: ["Lý Hải", "Diễm My 9X", "Trấn Thành"],
  },
  {
    id: 2,
    maphim: "PHIM002",
    title: "Bóng Tối Thành Phố",
    genre: "Hành động / Kinh dị",
    duration: "132 phút",
    rating: "T16",
    image: "https://images.unsplash.com/photo-1686511474243-4ec6094f82e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    score: 7.9,
    description: "Thành phố chìm vào bóng tối khi một tổ chức tội phạm bí ẩn trỗi dậy. Một thám tử cô đơn phải đối mặt với bí ẩn tăm tối nhất sự nghiệp của mình.",
    price: 85000,
    year: 2025,
    director: "Trần Anh Hùng",
    cast: ["Việt Anh", "Thu Trang", "Kiều Minh Tuấn"],
  },
  {
    id: 3,
    maphim: "PHIM003",
    title: "Bóng Ma Cuối Cùng",
    genre: "Kinh dị / Tâm lý",
    duration: "115 phút",
    rating: "T18",
    image: "https://images.unsplash.com/photo-1694800626642-c2a5c7ac96f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    score: 7.5,
    description: "Một gia đình chuyển đến ngôi nhà cũ và đối mặt với những thực thể bí ẩn đã sống trong đó từ hàng thập kỷ. Ranh giới giữa sống và chết dần mờ nhạt.",
    price: 80000,
    year: 2025,
    director: "Võ Thanh Hòa",
    cast: ["Nhã Phương", "Phương Anh Đào", "Huỳnh Đông"],
  },
  {
    id: 4,
    maphim: "PHIM004",
    title: "Tình Yêu Vĩnh Cửu",
    genre: "Tình cảm / Lãng mạn",
    duration: "122 phút",
    rating: "P",
    image: "https://images.unsplash.com/photo-1540909807320-9b689044fad3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    score: 8.1,
    description: "Câu chuyện tình yêu vượt qua mọi thử thách của đôi trẻ trong bối cảnh Hội An cổ kính. Một bộ phim về lòng dũng cảm và sức mạnh của tình yêu.",
    price: 75000,
    year: 2025,
    director: "Vũ Ngọc Đãng",
    cast: ["Kaity Nguyễn", "Jun Phạm", "Lan Ngọc"],
  },
  {
    id: 5,
    maphim: "PHIM005",
    title: "Rừng Thiêng",
    genre: "Phiêu lưu / Hành động",
    duration: "156 phút",
    rating: "T13",
    image: "https://images.unsplash.com/photo-1584748387157-98b679b3fdba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    score: 8.7,
    description: "Một nhóm thám hiểm mạo hiểm vào khu rừng nguyên sinh bí ẩn ở Trường Sơn và đối mặt với những bí ẩn chưa từng được giải đáp. Thiên nhiên không phải lúc nào cũng hiền lành.",
    price: 95000,
    year: 2025,
    director: "Dustin Nguyễn",
    cast: ["Thái Hòa", "Ngô Thanh Vân", "Trương Thanh Long"],
  },
  {
    id: 6,
    maphim: "PHIM006",
    title: "Ngọn Lửa Báo Thù",
    genre: "Hành động / Tội phạm",
    duration: "138 phút",
    rating: "T18",
    image: "https://images.unsplash.com/photo-1677508948659-0a10ad1f13a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    score: 8.0,
    description: "Sau khi gia đình bị tàn sát, một cựu chiến binh tìm kiếm sự báo thù trong bóng tối của xã hội tham nhũng. Ngọn lửa phục thù không bao giờ tắt.",
    price: 90000,
    year: 2025,
    director: "Charlie Nguyễn",
    cast: ["Johnny Trí Nguyễn", "Ngân Khánh", "Lý Nhã Kỳ"],
  },
];
const getSaved = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(() => getSaved('selectedMovie', null));
  const [selectedSeats, setSelectedSeats] = useState<string[]>(() => getSaved('selectedSeats', []));
  const [selectedShowtime, setSelectedShowtime] = useState<string>(() => getSaved('selectedShowtime', '19:30'));
  const [selectedDate, setSelectedDate] = useState<string>(() => getSaved('selectedDate', ''));
  const [selectedCinema, setSelectedCinema] = useState<string>(() => getSaved('selectedCinema', ''));
  const [selectedSuatChieu, setSelectedSuatChieu] = useState<ApiShowtime | null>(() => getSaved('selectedSuatChieu', null));
  // Tự động lưu trạng thái vào localStorage mỗi khi có sự thay đổi
  useEffect(() => {
    if (selectedMovie) localStorage.setItem('selectedMovie', JSON.stringify(selectedMovie));
    if (selectedSuatChieu) localStorage.setItem('selectedSuatChieu', JSON.stringify(selectedSuatChieu));
    localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    localStorage.setItem('selectedShowtime', JSON.stringify(selectedShowtime));
    localStorage.setItem('selectedDate', JSON.stringify(selectedDate));
    localStorage.setItem('selectedCinema', JSON.stringify(selectedCinema));
  }, [selectedMovie, selectedSuatChieu, selectedSeats, selectedShowtime, selectedDate, selectedCinema]);
  // Movie API states
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [showingMovies, setShowingMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [errorMovies, setErrorMovies] = useState<string | null>(null);
  
  // Showtime API states
  const [showtimes, setShowtimes] = useState<ApiShowtime[]>([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [errorShowtimes, setErrorShowtimes] = useState<string | null>(null);
  
  // Cinema API states
  const [cinemas, setCinemas] = useState<{ id: string; name: string; address: string }[]>([]);
  const [loadingCinemas, setLoadingCinemas] = useState(false);
  const [errorCinemas, setErrorCinemas] = useState<string | null>(null);
  
  // Store raw API data for status filtering
  const [apiMoviesData, setApiMoviesData] = useState<ApiMovie[]>([]);
  
  // Auth states
  const [user, setUser] = useState<TokenUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Logic chọn/bỏ chọn ghế
  const toggleSeat = (seatId: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId) // Có rồi thì xóa
        : [...prev, seatId]               // Chưa có thì thêm
    );
  };

  const clearSelectedSeats = () => setSelectedSeats([]);
  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = getUser();
    const token = getToken();
    if (storedUser && token) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const fetchMovies = async () => {
    try {
      setLoadingMovies(true);
      setErrorMovies(null);

      const apiMovies = await catalogAPI.getMovies();
      setApiMoviesData(apiMovies);

      // Transform API data to frontend format
      const transformedMovies = transformMoviesFromAPI(apiMovies);
      setAllMovies(transformedMovies);

      // Filter by status
      const showing = filterMoviesByStatus(transformedMovies, 'Showing', apiMovies);
      const upcoming = filterMoviesByStatus(transformedMovies, 'Upcoming', apiMovies);

      setShowingMovies(showing);
      setUpcomingMovies(upcoming);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách phim';
      setErrorMovies(message);
      console.error('[AppContext fetchMovies]', err);
    } finally {
      setLoadingMovies(false);
    }
  };

  const fetchShowtimes = async (maphim?: string, ngaychieu?: string, marap?: string) => {
    try {
      setLoadingShowtimes(true);
      setErrorShowtimes(null);

      const apiShowtimes = await catalogAPI.getShowtimes(maphim, ngaychieu, marap);
      setShowtimes(apiShowtimes);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách suất chiếu';
      setErrorShowtimes(message);
      console.error('[AppContext fetchShowtimes]', err);
    } finally {
      setLoadingShowtimes(false);
    }
  };

  const fetchCinemas = async () => {
    try {
      setLoadingCinemas(true);
      setErrorCinemas(null);

      const apiCinemas = await catalogAPI.getCinemas();
      const transformedCinemas = apiCinemas.map(mapCinemaData);
      setCinemas(transformedCinemas);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách rạp';
      setErrorCinemas(message);
      console.error('[AppContext fetchCinemas]', err);
    } finally {
      setLoadingCinemas(false);
    }
  };
  
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authAPI.login(username, password);
      
      // response.data should be { token, user }
      if (response.token && response.user) {
        saveToken(response.token);
        saveUser(response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Phản hồi từ server không hợp lệ');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi đăng nhập';
      setError(message);
      console.error('[AppContext login]', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    tokenLogout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AppContext.Provider value={{
      selectedMovie, setSelectedMovie,
      selectedSeats, setSelectedSeats,
      toggleSeat, clearSelectedSeats,
      selectedShowtime, setSelectedShowtime,
      selectedDate, setSelectedDate,
      selectedCinema, setSelectedCinema,
      selectedSuatChieu, setSelectedSuatChieu,
      allMovies,
      showingMovies,
      upcomingMovies,
      loadingMovies,
      errorMovies,
      fetchMovies,
      showtimes,
      loadingShowtimes,
      errorShowtimes,
      fetchShowtimes,
      cinemas,
      loadingCinemas,
      errorCinemas,
      fetchCinemas,
      user,
      isLoading,
      error,
      login,
      logout: handleLogout,
      isAuthenticated,
    }}>
      {children}
    </AppContext.Provider>
  );
};
