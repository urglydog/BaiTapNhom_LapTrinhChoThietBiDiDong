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

            // Fetch cinema halls with their cinema info
            // Since backend has @JsonBackReference on cinemaHall, 
            // we need to fetch cinemas that have halls matching our IDs
            // For simplicity, we'll map all cinemas to halls

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
    },    // Lấy lịch chiếu theo phim (tất cả ngày)
    getShowtimesByMovie: async (movieId: number): Promise<Showtime[]> => {
        try {
            const response = await api.get<ApiResponse<Showtime[]>>(
                `/showtimes/movie/${movieId}`
            );
            return response.data.result;
        } catch (error: any) {
            console.error('Error fetching showtimes:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể tải lịch chiếu'
            );
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
