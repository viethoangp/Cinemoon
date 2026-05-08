// Development mock data for API testing when database is unavailable
// This file serves as a fallback for development/testing

export const MOCK_PHIM_DATA = [
  {
    MAPHIM: "PH001",
    TENPHIM: "Mai",
    THELOAI: "Drama",
    THOILUONG: 120,
    DAODIEN: "Trần Anh Hùng",
    DIENVIEN: "Dương Hoàng Yên, Tú Hảo",
    NGAYPHATHANH: "2024-01-15",
    POSTER: "/img/poster-mai.jpg",
    TRAILER: "https://youtube.com/watch?v=example1",
    MOTA: "Một câu chuyện tình yêu đẹp giữa hai sinh viên tại Sài Gòn.",
    GIOIHANTUOI: 13,
    TRANGTHAI: "Showing"
  },
  {
    MAPHIM: "PH002",
    TENPHIM: "Godzilla x Kong: The New Empire",
    THELOAI: "Action/Sci-Fi",
    THOILUONG: 115,
    DAODIEN: "Adam Wingard",
    DIENVIEN: "Rebecca Hall, Brian Tyree Henry",
    NGAYPHATHANH: "2024-03-29",
    POSTER: "/img/poster-godzilla.jpg",
    TRAILER: "https://youtube.com/watch?v=example2",
    MOTA: "Hai quái vật huyền thoại tái đấu trong một trận chiến kỳ vĩ.",
    GIOIHANTUOI: 13,
    TRANGTHAI: "Showing"
  },
  {
    MAPHIM: "PH003",
    TENPHIM: "Dune: Part Two",
    THELOAI: "Sci-Fi/Adventure",
    THOILUONG: 166,
    DAODIEN: "Denis Villeneuve",
    DIENVIEN: "Timothée Chalamet, Zendaya, Rebecca Ferguson",
    NGAYPHATHANH: "2024-02-28",
    POSTER: "/img/poster-dune.jpg",
    TRAILER: "https://youtube.com/watch?v=example3",
    MOTA: "Paul Atreides tiếp tục hành trình của anh trên Arrakis.",
    GIOIHANTUOI: 13,
    TRANGTHAI: "Showing"
  },
  {
    MAPHIM: "PH004",
    TENPHIM: "Inside Out 2",
    THELOAI: "Animation/Comedy",
    THOILUONG: 96,
    DAODIEN: "Kelsey Mann",
    DIENVIEN: "Phyllis Smith, Maya Hawke, Tony Hale",
    NGAYPHATHANH: "2024-06-14",
    POSTER: "/img/poster-insideout.jpg",
    TRAILER: "https://youtube.com/watch?v=example4",
    MOTA: "Riley, bây giờ đã là thiếu nữ, phải đối mặt với những cảm xúc mới.",
    GIOIHANTUOI: 0,
    TRANGTHAI: "Showing"
  },
  {
    MAPHIM: "PH005",
    TENPHIM: "Deadpool & Wolverine",
    THELOAI: "Action/Comedy",
    THOILUONG: 128,
    DAODIEN: "Shawn Levy",
    DIENVIEN: "Ryan Reynolds, Hugh Jackman",
    NGAYPHATHANH: "2024-07-26",
    POSTER: "/img/poster-deadpool.jpg",
    TRAILER: "https://youtube.com/watch?v=example5",
    MOTA: "Deadpool và Wolverine cùng nhau trở lại trong một cuộc phiêu lưu điên rồ.",
    GIOIHANTUOI: 16,
    TRANGTHAI: "Upcoming"
  },
  {
    MAPHIM: "PH006",
    TENPHIM: "Joker: Folie à Deux",
    THELOAI: "Drama/Thriller",
    THOILUONG: 138,
    DAODIEN: "Todd Phillips",
    DIENVIEN: "Joaquin Phoenix, Lady Gaga",
    NGAYPHATHANH: "2024-10-04",
    POSTER: "/img/poster-joker.jpg",
    TRAILER: "https://youtube.com/watch?v=example6",
    MOTA: "Arthur Fleck gặp Harleen Quinzel trong một viện tâm thần.",
    GIOIHANTUOI: 18,
    TRANGTHAI: "Upcoming"
  },
  {
    MAPHIM: "PH007",
    TENPHIM: "Venom: The Last Dance",
    THELOAI: "Action/Sci-Fi",
    THOILUONG: 109,
    DAODIEN: "Kelly Marcel",
    DIENVIEN: "Tom Hardy, Chiwetel Ejiofor",
    NGAYPHATHANH: "2024-10-25",
    POSTER: "/img/poster-venom.jpg",
    TRAILER: "https://youtube.com/watch?v=example7",
    MOTA: "Venom trở lại với một cuộc phiêu lưu mới đầy thử thách.",
    GIOIHANTUOI: 16,
    TRANGTHAI: "Upcoming"
  },
];

// Mock showtimes data
export const MOCK_SUAT_CHIEU_DATA = [
  // PH001 - Mai showtimes for 2026-05-08
  { MASUAT: "ST001", MAPHIM: "PH001", MAPHONG: "PC001", NGAYCHIEU: "2026-05-08", GIOBATDAU: "09:00:00", GIOKETTHUC: "10:45:00", TRANGTHAISUAT: "Available" },
  { MASUAT: "ST002", MAPHIM: "PH001", MAPHONG: "PC002", NGAYCHIEU: "2026-05-08", GIOBATDAU: "14:00:00", GIOKETTHUC: "15:45:00", TRANGTHAISUAT: "Available" },
  { MASUAT: "ST003", MAPHIM: "PH001", MAPHONG: "PC001", NGAYCHIEU: "2026-05-08", GIOBATDAU: "19:00:00", GIOKETTHUC: "20:45:00", TRANGTHAISUAT: "Available" },
  { MASUAT: "ST004", MAPHIM: "PH001", MAPHONG: "PC003", NGAYCHIEU: "2026-05-08", GIOBATDAU: "21:30:00", GIOKETTHUC: "23:15:00", TRANGTHAISUAT: "Available" },

  // PH002 - Godzilla x Kong showtimes for 2026-05-08
  { MASUAT: "ST005", MAPHIM: "PH002", MAPHONG: "PC002", NGAYCHIEU: "2026-05-08", GIOBATDAU: "10:00:00", GIOKETTHUC: "11:55:00", TRANGTHAISUAT: "Available" },
  { MASUAT: "ST006", MAPHIM: "PH002", MAPHONG: "PC001", NGAYCHIEU: "2026-05-08", GIOBATDAU: "15:30:00", GIOKETTHUC: "17:25:00", TRANGTHAISUAT: "Available" },
  { MASUAT: "ST007", MAPHIM: "PH002", MAPHONG: "PC003", NGAYCHIEU: "2026-05-08", GIOBATDAU: "20:00:00", GIOKETTHUC: "21:55:00", TRANGTHAISUAT: "Available" },

  // PH003 - Dune Part Two showtimes for 2026-05-08
  { MASUAT: "ST008", MAPHIM: "PH003", MAPHONG: "PC001", NGAYCHIEU: "2026-05-08", GIOBATDAU: "09:30:00", GIOKETTHUC: "11:36:00", TRANGTHAISUAT: "Available" },
  { MASUAT: "ST009", MAPHIM: "PH003", MAPHONG: "PC002", NGAYCHIEU: "2026-05-08", GIOBATDAU: "13:00:00", GIOKETTHUC: "15:06:00", TRANGTHAISUAT: "Available" },
  { MASUAT: "ST010", MAPHIM: "PH003", MAPHONG: "PC003", NGAYCHIEU: "2026-05-08", GIOBATDAU: "18:00:00", GIOKETTHUC: "20:06:00", TRANGTHAISUAT: "Available" },

  // PH004 - Inside Out 2 showtimes for 2026-05-08
  { MASUAT: "ST011", MAPHIM: "PH004", MAPHONG: "PC001", NGAYCHIEU: "2026-05-08", GIOBATDAU: "10:30:00", GIOKETTHUC: "11:45:00", TRANGTHAISUAT: "Available" },
  { MASUAT: "ST012", MAPHIM: "PH004", MAPHONG: "PC002", NGAYCHIEU: "2026-05-08", GIOBATDAU: "15:00:00", GIOKETTHUC: "16:15:00", TRANGTHAISUAT: "Available" },
  { MASUAT: "ST013", MAPHIM: "PH004", MAPHONG: "PC003", NGAYCHIEU: "2026-05-08", GIOBATDAU: "17:30:00", GIOKETTHUC: "18:45:00", TRANGTHAISUAT: "Available" },
  { MASUAT: "ST014", MAPHIM: "PH004", MAPHONG: "PC001", NGAYCHIEU: "2026-05-08", GIOBATDAU: "20:00:00", GIOKETTHUC: "21:15:00", TRANGTHAISUAT: "Available" },

  // PH005 - Deadpool & Wolverine showtimes for 2026-05-09
  { MASUAT: "ST015", MAPHIM: "PH005", MAPHONG: "PC002", NGAYCHIEU: "2026-05-09", GIOBATDAU: "14:00:00", GIOKETTHUC: "15:48:00", TRANGTHAISUAT: "Available" },
  { MASUAT: "ST016", MAPHIM: "PH005", MAPHONG: "PC001", NGAYCHIEU: "2026-05-09", GIOBATDAU: "19:30:00", GIOKETTHUC: "21:18:00", TRANGTHAISUAT: "Available" },

  // PH006 - Joker Folie à Deux showtimes for 2026-05-09
  { MASUAT: "ST017", MAPHIM: "PH006", MAPHONG: "PC003", NGAYCHIEU: "2026-05-09", GIOBATDAU: "19:00:00", GIOKETTHUC: "20:18:00", TRANGTHAISUAT: "Available" },
  { MASUAT: "ST018", MAPHIM: "PH006", MAPHONG: "PC002", NGAYCHIEU: "2026-05-09", GIOBATDAU: "21:00:00", GIOKETTHUC: "22:18:00", TRANGTHAISUAT: "Available" },

  // PH007 - Venom The Last Dance showtimes for 2026-05-10
  { MASUAT: "ST019", MAPHIM: "PH007", MAPHONG: "PC001", NGAYCHIEU: "2026-05-10", GIOBATDAU: "20:00:00", GIOKETTHUC: "21:45:00", TRANGTHAISUAT: "Available" },
  { MASUAT: "ST020", MAPHIM: "PH007", MAPHONG: "PC003", NGAYCHIEU: "2026-05-10", GIOBATDAU: "22:00:00", GIOKETTHUC: "23:45:00", TRANGTHAISUAT: "Available" },
];

// Mock cinemas data
export const MOCK_RAP_DATA = [
  { MARAP: "RAP001", TENRAP: "Cinemoon Landmark 81", DIACHI: "Tầng 66, 66 Đường Tôn Đức Thắng, Bến Nghé, Quận 1, TP.HCM" },
  { MARAP: "RAP002", TENRAP: "Cinemoon Diamond Plaza", DIACHI: "Tầng 7, 34 Đường Lê Duẩn, Tây Hồ, Hà Nội" },
  { MARAP: "RAP003", TENRAP: "Cinemoon Vincom Mega Mall", DIACHI: "Tầng 4, 159 Đường Xa Lộ Hà Nội, Hà Đông, Hà Nội" },
  { MARAP: "RAP004", TENRAP: "Cinemoon Bitexco", DIACHI: "Tầng 26, 2 Hải Triều, Bến Nghé, Quận 1, TP.HCM" },
  { MARAP: "RAP005", TENRAP: "Cinemoon Saigon Centre", DIACHI: "Tầng 20-21, 65 Lê Lợi, Bến Nghé, Quận 1, TP.HCM" },
  { MARAP: "RAP006", TENRAP: "Cinemoon Tân Bình", DIACHI: "Tầng 5, 60 Đường 3 Tháng 2, Tân Bình, TP.HCM" },
];

// Mock API response formatter
export function createMockApiResponse<T>(data: T, success: boolean = true, message: string = "OK"): any {
  return {
    success,
    message,
    data
  };
}
