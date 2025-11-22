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
            const response = await api.get<ApiResponse<Showtime[]>>(
                `/showtimes/movie/${movieId}`
            );
            const showtimes = response.data.result || [];
            
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
                    
                    // Nếu không có, thử fetch detail
                    try {
                        const detailResponse = await api.get(`/showtimes/${st.id}`);
                        const detail = detailResponse.data.result;
                        if (detail.cinemaHall && detail.cinemaHall.id) {
                            return {
                                ...st,
                                cinemaHallId: detail.cinemaHall.id,
                            };
                        }
                    } catch (e) {
                        // Ignore error
                    }
                    
                    return st;
                })
            );
            
            return showtimesWithHallId;
        } catch (error: any) {
            console.error('Error fetching showtimes:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể tải lịch chiếu'
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

