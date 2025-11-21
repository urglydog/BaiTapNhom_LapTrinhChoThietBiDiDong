import api, { ApiResponse } from './api';
import { Movie } from '../types';

export const movieService = {
    // Get all movies
    getAllMovies: async (): Promise<Movie[]> => {
        try {
            const response = await api.get<ApiResponse<Movie[]>>('/movies');
            return response.data.result;
        } catch (error: any) {
            console.error('Error fetching movies:', error);
            throw new Error(error.response?.data?.message || 'Không thể tải danh sách phim');
        }
    },

    // Get movie by ID
    getMovieById: async (movieId: number): Promise<Movie> => {
        try {
            const response = await api.get<ApiResponse<Movie>>(`/movies/${movieId}`);
            return response.data.result;
        } catch (error: any) {
            console.error('Error fetching movie:', error);
            throw new Error(error.response?.data?.message || 'Không thể tải thông tin phim');
        }
    },

    // Get now showing movies
    getNowShowingMovies: async (): Promise<Movie[]> => {
        try {
            const response = await api.get<ApiResponse<Movie[]>>('/movies/now-showing');
            return response.data.result;
        } catch (error: any) {
            console.error('Error fetching now showing movies:', error);
            throw new Error(error.response?.data?.message || 'Không thể tải phim đang chiếu');
        }
    },

    // Get coming soon movies
    getComingSoonMovies: async (): Promise<Movie[]> => {
        try {
            const response = await api.get<ApiResponse<Movie[]>>('/movies/coming-soon');
            return response.data.result;
        } catch (error: any) {
            console.error('Error fetching coming soon movies:', error);
            throw new Error(error.response?.data?.message || 'Không thể tải phim sắp chiếu');
        }
    },

    // Search movies
    searchMovies: async (keyword: string): Promise<Movie[]> => {
        try {
            const response = await api.get<ApiResponse<Movie[]>>('/movies/search', {
                params: { keyword }
            });
            return response.data.result;
        } catch (error: any) {
            console.error('Error searching movies:', error);
            throw new Error(error.response?.data?.message || 'Không thể tìm kiếm phim');
        }
    },
};
