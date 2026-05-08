import { Movie } from '../context/AppContext';
import { ApiMovie, ApiShowtime, ApiCinema } from '../services/api';

/**
 * Map GIOIHANTUOI (age limit) to rating badge text
 * 0/P → P (General), 13 → T13, 16 → T16, 18 → T18
 */
function mapAgeToRating(age: number | null): string {
  if (!age || age === 0) return 'P';
  if (age >= 13 && age < 16) return 'T13';
  if (age >= 16 && age < 18) return 'T16';
  if (age >= 18) return 'T18';
  return 'P';
}

/**
 * Format duration from minutes to "XXX phút"
 */
function formatDuration(minutes: number): string {
  return `${minutes} phút`;
}

/**
 * Extract year from date string (YYYY-MM-DD)
 */
function extractYear(dateString: string): number {
  try {
    return parseInt(dateString.split('-')[0], 10);
  } catch {
    return new Date().getFullYear();
  }
}

/**
 * Parse cast string (comma-separated names) into array
 */
function parseCast(castString: string): string[] {
  return castString
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);
}

/**
 * Parse MAPHIM (e.g., "PH001") to numeric ID
 */
function parseMovieId(maphim: string): number {
  const match = maphim.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Transform API movie data to Frontend Movie interface
 */
export function transformMovieFromAPI(apiMovie: ApiMovie): Movie {
  // Generate numeric ID from MAPHIM string
  const id = parseMovieId(apiMovie.MAPHIM);

  // Map age limit to rating badge
  const rating = mapAgeToRating(apiMovie.GIOIHANTUOI);

  // Format duration
  const duration = formatDuration(apiMovie.THOILUONG);

  // Extract year
  const year = extractYear(apiMovie.NGAYPHATHANH);

  // Parse cast
  const cast = parseCast(apiMovie.DIENVIEN);

  // Default price (will be overridden by QUY_DINH_GIA later)
  const price = 75000;

  // Default score (future enhancement: fetch from reviews)
  const score = 8.0;

  return {
    id,
    maphim: apiMovie.MAPHIM, // Keep original API ID for matching
    title: apiMovie.TENPHIM,
    genre: apiMovie.THELOAI,
    duration,
    rating,
    image: apiMovie.POSTER, // Backend already returns /img/poster-xxx.jpg
    score,
    description: apiMovie.MOTA,
    price,
    year,
    director: apiMovie.DAODIEN,
    cast,
  };
}

/**
 * Transform array of API movies to Frontend Movie array
 */
export function transformMoviesFromAPI(apiMovies: ApiMovie[]): Movie[] {
  return apiMovies.map(transformMovieFromAPI);
}

/**
 * Filter movies by status
 */
export function filterMoviesByStatus(
  movies: Movie[],
  status: 'Showing' | 'Upcoming',
  apiMovies: ApiMovie[]
): Movie[] {
  // Match with API data by ID to check TRANGTHAI
  return movies.filter((movie, index) => {
    const apiMovie = apiMovies[index];
    return apiMovie?.TRANGTHAI === status;
  });
}

/**
 * Convert time string (HH:MM:SS) to display format (HH:MM)
 */
export function formatTimeToHHMM(timeString: string): string {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}`;
}

/**
 * Group showtimes by time period
 * Morning: 08:00-11:30, Afternoon: 11:30-17:00, Evening: 17:00-23:59
 */
export function groupShowtimesByTime(
  showtimes: ApiShowtime[]
): { morning: ApiShowtime[]; afternoon: ApiShowtime[]; evening: ApiShowtime[] } {
  const groups = {
    morning: [] as ApiShowtime[],
    afternoon: [] as ApiShowtime[],
    evening: [] as ApiShowtime[],
  };

  showtimes.forEach(showtime => {
    const [hours] = showtime.GIOBATDAU.split(':');
    const hour = parseInt(hours, 10);

    if (hour < 12) {
      groups.morning.push(showtime);
    } else if (hour < 17) {
      groups.afternoon.push(showtime);
    } else {
      groups.evening.push(showtime);
    }
  });

  return groups;
}

/**
 * Check if showtime is high-demand (evening rush hours: 19:00-21:30)
 */
export function isHighDemandTime(showtime: ApiShowtime): boolean {
  const [hours, minutes] = showtime.GIOBATDAU.split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  const totalMinutes = hour * 60 + minute;
  
  return totalMinutes >= 19 * 60 && totalMinutes <= 21 * 60 + 30;
}

/**
 * Transform cinema data from API to display format
 */
export function mapCinemaData(apiCinema: ApiCinema): { id: string; name: string; address: string } {
  return {
    id: apiCinema.MARAP,
    name: apiCinema.TENRAP,
    address: apiCinema.DIACHI,
  };
}
