import api from './api';
import { Showtime, ShowtimeWithCinema, Seat, SeatWithStatus } from '../types';

interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

export const showtimeService = {
    // Lấy lịch chiếu theo phim và ngày - với cinema info
    getShowtimesByMovieAndDate: async (
        movieId: number,
        showDate: string
    ): Promise<ShowtimeWithCinema[]> => {
        try {
            console.log('🎬 Fetching showtimes for movie:', movieId, 'date:', showDate);
            const response = await api.get<ApiResponse<Showtime[]>>(
                `/showtimes/movie/${movieId}/date/${showDate}`
            );

            console.log('📋 Showtimes API response:', response.data);

            const showtimes = response.data.result;
            if (!showtimes || showtimes.length === 0) {
                console.log('⚠️ No showtimes found for this date');
                return [];
            }

            console.log('First showtime structure:', showtimes[0]);

            // Fetch all cinemas once
            const cinemasResponse = await api.get<ApiResponse<any[]>>('/cinemas');
            const allCinemas = cinemasResponse.data.result;
            console.log('🏢 All cinemas loaded:', allCinemas.length);

            // Get unique cinema hall IDs from showtimes
            const cinemaHallIds = Array.from(new Set(showtimes.map(st => st.cinemaHallId)));
            console.log('Cinema hall IDs to fetch:', cinemaHallIds);

            // Create cinema hall to cinema mapping from cinema.halls if available
            const hallToCinemaMap: { [hallId: number]: any } = {};

            for (const cinema of allCinemas) {
                // Check if cinema has halls property
                if ((cinema as any).halls && Array.isArray((cinema as any).halls)) {
                    for (const hall of (cinema as any).halls) {
                        hallToCinemaMap[hall.id] = cinema;
                    }
                } else {
                    // If no halls info, try to match by fetching cinema showtimes
                    // Or assign to all halls as fallback
                    cinemaHallIds.forEach(hallId => {
                        if (!hallToCinemaMap[hallId]) {
                            hallToCinemaMap[hallId] = cinema;
                        }
                    });
                }
            }

            console.log('Hall to Cinema mapping:', hallToCinemaMap);

            // Map showtimes with cinema info
            const showtimesWithCinema: ShowtimeWithCinema[] = showtimes.map((showtime) => {
                const cinema = hallToCinemaMap[showtime.cinemaHallId] || allCinemas[0];
                console.log(`Mapping showtime ${showtime.id} with cinema:`, cinema?.name);

                return {
                    ...showtime,
                    cinema: cinema,
                };
            });

            console.log('✅ Showtimes with cinema mapped:', showtimesWithCinema.length);
            return showtimesWithCinema;
        } catch (error: any) {
            console.error('❌ Error fetching showtimes:', error);
            console.error('Error details:', error.response?.data);
            throw new Error(
                error.response?.data?.message || 'Không thể tải lịch chiếu'
            );
        }
    },
    
    // Lấy lịch chiếu theo phim (tất cả ngày)
    getShowtimesByMovie: async (movieId: number): Promise<Showtime[]> => {
        try {
            console.log('🎬 Fetching showtimes for movie ID:', movieId);
            const url = `/showtimes/movie/${movieId}`;
            console.log('📡 Full URL will be:', `${api.defaults.baseURL}${url}`);
            
            const response = await api.get<ApiResponse<Showtime[]>>(url);
            
            console.log('📡 Showtimes API Response:', JSON.stringify(response.data, null, 2));
            
            // Xử lý nhiều format response
            let showtimes: Showtime[] = [];
            
            if (response.data) {
                // Format 1: { code: 200, message: "...", result: [...] }
                if (response.data.code === 200 && Array.isArray(response.data.result)) {
                    showtimes = response.data.result;
                    console.log('✅ Found showtimes in result array:', showtimes.length);
                }
                // Format 2: Response trực tiếp là array
                else if (Array.isArray(response.data)) {
                    showtimes = response.data;
                    console.log('✅ Response is direct array:', showtimes.length);
                }
                // Format 3: { result: [...] } (không có code)
                else if (Array.isArray(response.data.result)) {
                    showtimes = response.data.result;
                    console.log('✅ Found showtimes in result (no code):', showtimes.length);
                }
                // Format 4: { data: [...] }
                else if (Array.isArray(response.data.data)) {
                    showtimes = response.data.data;
                    console.log('✅ Found showtimes in data:', showtimes.length);
                }
            }
            
            if (!showtimes || showtimes.length === 0) {
                console.log('⚠️ No showtimes found for movie:', movieId);
                return []; // Trả về mảng rỗng thay vì throw error
            }
            
            console.log('📋 Processing showtimes, adding cinemaHallId...');
            
            // Vì cinemaHall có @JsonBackReference, cần map lại để có cinemaHallId
            // Thử lấy từ cinemaHall.id hoặc fetch từng showtime detail
            const showtimesWithHallId = await Promise.all(
                showtimes.map(async (st: any) => {
                    // Nếu đã có cinemaHallId, giữ nguyên
                    if (st.cinemaHallId) {
                        return st;
                    }
                    
                    // Nếu có cinemaHall object, lấy id từ đó
                    if (st.cinemaHall && st.cinemaHall.id) {
                        return {
                            ...st,
                            cinemaHallId: st.cinemaHall.id,
                        };
                    }
                    
                    // Nếu không có, thử fetch detail (chỉ cho vài cái đầu để tránh quá nhiều request)
                    try {
                        const detailResponse = await api.get(`/showtimes/${st.id}`);
                        const detail = detailResponse.data.result;
                        if (detail && detail.cinemaHall && detail.cinemaHall.id) {
                            return {
                                ...st,
                                cinemaHallId: detail.cinemaHall.id,
                            };
                        }
                    } catch (e) {
                        console.log(`⚠️ Could not fetch detail for showtime ${st.id}`);
                    }
                    
                    return st;
                })
            );
            
            console.log('✅ Processed showtimes:', showtimesWithHallId.length);
            return showtimesWithHallId;
        } catch (error: any) {
            console.error('❌ Error fetching showtimes:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText,
                isNetworkError: (error as any).isNetworkError,
                isTimeoutError: (error as any).isTimeoutError,
                isCorsError: (error as any).isCorsError,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    baseURL: error.config?.baseURL,
                },
            });
            
            // Nếu là network error từ interceptor, throw lại message đã được format
            if ((error as any).isNetworkError || (error as any).isTimeoutError || (error as any).isCorsError) {
                throw error; // Throw lại error đã được format từ interceptor
            }
            
            // Nếu là network error thông thường (không có response)
            if (!error.response) {
                // Kiểm tra xem có phải là Render.com không
                const url = error.config?.baseURL || '';
                if (url.includes('onrender.com')) {
                    throw new Error('Server đang khởi động. Vui lòng đợi vài giây rồi thử lại.');
                }
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
            }
            
            // Nếu server trả về 404 hoặc empty result, trả về mảng rỗng
            if (error.response?.status === 404) {
                console.log('⚠️ No showtimes found (404)');
                return [];
            }
            
            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Không thể tải lịch chiếu'
            );
        }
    },

    // Lấy lịch chiếu theo phim và rạp
    getShowtimesByMovieAndCinema: async (
        movieId: number,
        cinemaId: number
    ): Promise<ShowtimeWithCinema[]> => {
        try {
            // Lấy tất cả showtimes của phim
            const allShowtimes = await showtimeService.getShowtimesByMovie(movieId);
            
            // Fetch cinemas để map
            const cinemasResponse = await api.get<ApiResponse<any[]>>('/cinemas');
            const allCinemas = cinemasResponse.data.result;
            
            // Lấy cinema halls của rạp này
            const cinema = allCinemas.find(c => c.id === cinemaId);
            if (!cinema) {
                return [];
            }
            
            // Lấy danh sách hall IDs của rạp này
            let hallIds: number[] = [];
            if ((cinema as any).halls && Array.isArray((cinema as any).halls)) {
                hallIds = (cinema as any).halls.map((h: any) => h.id);
            } else {
                // Fallback: lấy từ API cinema halls
                try {
                    const hallsResponse = await api.get<ApiResponse<any[]>>(
                        `/cinemas/${cinemaId}/halls`
                    );
                    hallIds = hallsResponse.data.result.map((h: any) => h.id);
                } catch (e) {
                    console.log('Could not fetch halls for cinema');
                }
            }
            
            // Filter showtimes có cinemaHallId trong danh sách halls của rạp
            const filteredShowtimes = allShowtimes.filter(st => 
                hallIds.includes(st.cinemaHallId)
            );
            
            // Map với cinema info
            return filteredShowtimes.map(st => ({
                ...st,
                cinema: cinema,
            }));
        } catch (error: any) {
            console.error('Error fetching showtimes by movie and cinema:', error);
            return [];
        }
    },

    // Lấy chi tiết suất chiếu
    getShowtimeById: async (showtimeId: number): Promise<Showtime> => {
        try {
            const response = await api.get<ApiResponse<Showtime>>(
                `/showtimes/${showtimeId}`
            );
            return response.data.result;
        } catch (error: any) {
            console.error('Error fetching showtime:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể tải thông tin suất chiếu'
            );
        }
    },

    // Lấy danh sách ghế còn trống của suất chiếu
    getAvailableSeats: async (showtimeId: number): Promise<Seat[]> => {
        try {
            const response = await api.get<ApiResponse<Seat[]>>(
                `/showtimes/${showtimeId}/available-seats`
            );
            return response.data.result;
        } catch (error: any) {
            console.error('Error fetching available seats:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể tải danh sách ghế'
            );
        }
    },

    // Lấy tất cả ghế của suất chiếu (bao gồm đã đặt)
    getAllSeats: async (showtimeId: number): Promise<Seat[]> => {
        try {
            const response = await api.get<ApiResponse<Seat[]>>(
                `/showtimes/${showtimeId}/seats`
            );
            return response.data.result;
        } catch (error: any) {
            console.error('Error fetching seats:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể tải danh sách ghế'
            );
        }
    },

    // Lấy danh sách ghế với trạng thái đặt
    getSeatsWithStatus: async (showtimeId: number): Promise<SeatWithStatus[]> => {
        try {
            // Get all seats
            const allSeatsResponse = await api.get<ApiResponse<Seat[]>>(
                `/showtimes/${showtimeId}/seats`
            );
            const allSeats = allSeatsResponse.data.result;

            // Get available seats
            const availableSeatsResponse = await api.get<ApiResponse<Seat[]>>(
                `/showtimes/${showtimeId}/available-seats`
            );
            const availableSeats = availableSeatsResponse.data.result;
            const availableSeatIds = new Set(availableSeats.map((s) => s.id));

            // Mark booked seats
            const seatsWithStatus: SeatWithStatus[] = allSeats.map((seat) => ({
                ...seat,
                isBooked: !availableSeatIds.has(seat.id),
                isSelected: false,
            }));

            return seatsWithStatus;
        } catch (error: any) {
            console.error('Error fetching seats with status:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể tải danh sách ghế'
            );
        }
    },
};

