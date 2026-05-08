import { getConnection } from '../config/db.js';

export const getMovies = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        
        // Truy vấn lấy danh sách phim (Đang chiếu và Sắp chiếu)
        // Format lại ngày tháng bằng TO_CHAR để Frontend dễ hiển thị
        const query = `
            SELECT MAPHIM, TENPHIM, THELOAI, THOILUONG, DAODIEN, DIENVIEN, 
                   TO_CHAR(NGAYPHATHANH, 'YYYY-MM-DD') AS NGAYPHATHANH, 
                   POSTER, TRAILER, MOTA, GIOIHANTUOI, TRANGTHAI 
            FROM PHIM 
            WHERE TRANGTHAI IN ('Showing', 'Upcoming')
            ORDER BY NGAYPHATHANH DESC
        `;
        
        const result = await connection.execute(query);

        res.status(200).json({
            success: true,
            data: result.rows,
            message: 'Lấy danh sách phim thành công.'
        });

    } catch (error) {
        console.error('Lỗi tại getMovies:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi máy chủ khi lấy dữ liệu phim.' 
        });
    } finally {
        // QUY TẮC SỐNG CÒN: Luôn trả connection về Pool
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Lỗi khi đóng kết nối Oracle:', err);
            }
        }
    }
};

export const getShowtimes = async (req, res) => {
    try {
        const { maphim, maphong, ngaychieu } = req.query;
        
        // TODO: Use catalogController.getSuatChieu or implement here
        res.status(200).json({
            success: true,
            data: [],
            message: 'Lấy danh sách suất chiếu thành công. (Chưa triển khai)'
        });
    } catch (error) {
        console.error('Lỗi tại getShowtimes:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ khi lấy dữ liệu suất chiếu.'
        });
    }
};

export const getSeats = async (req, res) => {
    try {
        const { maphong, masuat } = req.query;
        
        // TODO: Use catalogController.getGheNgoi or implement here
        res.status(200).json({
            success: true,
            data: [],
            message: 'Lấy danh sách ghế thành công. (Chưa triển khai)'
        });
    } catch (error) {
        console.error('Lỗi tại getSeats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ khi lấy dữ liệu ghế.'
        });
    }
};