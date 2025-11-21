import api from './api';
import { Cinema, CinemaHall } from '../types';

interface ApiResponse<T> {
    code: number;
    message: string;
    result: T;
}

export const cinemaService = {
    // Lấy tất cả rạp
    getAllCinemas: async (): Promise<Cinema[]> => {
        try {
            const response = await api.get<ApiResponse<Cinema[]>>('/cinemas');
            return response.data.result;
        } catch (error: any) {
            console.error('Error fetching cinemas:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể tải danh sách rạp'
            );
        }
    },

    // Lấy rạp đang hoạt động
    getActiveCinemas: async (): Promise<Cinema[]> => {
        try {
            const response = await api.get<ApiResponse<Cinema[]>>('/cinemas/active');
            return response.data.result;
        } catch (error: any) {
            console.error('Error fetching active cinemas:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể tải danh sách rạp'
            );
        }
    },

    // Lấy chi tiết rạp
    getCinemaById: async (cinemaId: number): Promise<Cinema> => {
        try {
            const response = await api.get<ApiResponse<Cinema>>(
                `/cinemas/${cinemaId}`
            );
            return response.data.result;
        } catch (error: any) {
            console.error('Error fetching cinema:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể tải thông tin rạp'
            );
        }
    },

    // Lấy rạp theo thành phố
    getCinemasByCity: async (city: string): Promise<Cinema[]> => {
        try {
            const response = await api.get<ApiResponse<Cinema[]>>(
                `/cinemas/city/${city}`
            );
            return response.data.result;
        } catch (error: any) {
            console.error('Error fetching cinemas by city:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể tải danh sách rạp'
            );
        }
    },

    // Lấy thông tin phòng chiếu
    getCinemaHallById: async (hallId: number): Promise<CinemaHall> => {
        try {
            const response = await api.get<ApiResponse<CinemaHall>>(
                `/cinema-halls/${hallId}`
            );
            return response.data.result;
        } catch (error: any) {
            console.error('Error fetching cinema hall:', error);
            throw new Error(
                error.response?.data?.message || 'Không thể tải thông tin phòng chiếu'
            );
        }
    },
};
