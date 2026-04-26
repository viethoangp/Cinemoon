import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Movie {
  id: number;
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
  selectedMovie: Movie | null;
  setSelectedMovie: (movie: Movie | null) => void;
  selectedSeats: string[];
  setSelectedSeats: (seats: string[]) => void;
  selectedShowtime: string;
  setSelectedShowtime: (showtime: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedCinema: string;
  setSelectedCinema: (cinema: string) => void;
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

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(MOVIES[4]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>(['D5', 'D6']);
  const [selectedShowtime, setSelectedShowtime] = useState('19:30');
  const [selectedDate, setSelectedDate] = useState('2025-04-26');
  const [selectedCinema, setSelectedCinema] = useState('Cinemoon Hà Nội - Mipec');

  return (
    <AppContext.Provider value={{
      selectedMovie, setSelectedMovie,
      selectedSeats, setSelectedSeats,
      selectedShowtime, setSelectedShowtime,
      selectedDate, setSelectedDate,
      selectedCinema, setSelectedCinema,
    }}>
      {children}
    </AppContext.Provider>
  );
};
