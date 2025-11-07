import api from './api';
import { Movie, Showtime, Cinema, Review, Favourite } from '../types';

export const movieService = {
  // Lấy danh sách phim
  getMovies: async (page: number = 0, size: number = 10): Promise<any> => {
    const response = await api.get(`/movies?page=${page}&size=${size}`);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to fetch movies');
  },

  // Lấy chi tiết phim
  getMovieById: async (id: number): Promise<Movie> => {
    const response = await api.get(`/movies/${id}`);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to fetch movie');
  },

  // Tìm kiếm phim (client-side search vì server không có endpoint)
  searchMovies: async (query: string, allMoviesList?: Movie[]): Promise<Movie[]> => {
    try {
      // Thử gọi API search trước (nếu có trong tương lai)
      try {
        const response = await api.get(`/movies/search?q=${encodeURIComponent(query)}`);
        if (response.data.code === 200) {
          const result = response.data.result;
          if (Array.isArray(result)) {
            return result;
          } else if (result?.content && Array.isArray(result.content)) {
            return result.content;
          }
          return [];
        }
      } catch (apiError: any) {
        // Nếu API không tồn tại (404/400), thực hiện tìm kiếm local
        if (apiError.response?.status === 404 || apiError.response?.status === 400) {
          console.log('Search API not available, using local search');
          
          // Nếu đã có danh sách phim, dùng luôn; nếu không thì fetch
          let allMovies: Movie[] = allMoviesList || [];
          
          if (allMovies.length === 0) {
            const allMoviesResponse = await api.get(`/movies?page=0&size=100`);
            if (allMoviesResponse.data.code === 200) {
              const result = allMoviesResponse.data.result;
              if (Array.isArray(result)) {
                allMovies = result;
              } else if (result?.content && Array.isArray(result.content)) {
                allMovies = result.content;
              } else if (result?.result) {
                if (Array.isArray(result.result)) {
                  allMovies = result.result;
                } else if (result.result?.content && Array.isArray(result.result.content)) {
                  allMovies = result.result.content;
                }
              }
            }
          }
          
          // Tìm kiếm local
          const queryLower = query.toLowerCase().trim();
          return allMovies.filter((movie: Movie) => 
            movie.title?.toLowerCase().includes(queryLower) ||
            movie.genre?.toLowerCase().includes(queryLower) ||
            movie.director?.toLowerCase().includes(queryLower) ||
            movie.cast?.toLowerCase().includes(queryLower) ||
            movie.description?.toLowerCase().includes(queryLower)
          );
        }
        throw apiError;
      }
      return [];
    } catch (error: any) {
      console.error('Search error:', error);
      throw new Error('Không thể tìm kiếm phim. Vui lòng thử lại.');
    }
  },

  // Lấy lịch chiếu của phim
  getMovieShowtimes: async (movieId: number): Promise<Showtime[]> => {
    const response = await api.get(`/movies/${movieId}/showtimes`);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to fetch showtimes');
  },

  // Lấy danh sách rạp
  getCinemas: async (): Promise<Cinema[]> => {
    const response = await api.get('/cinemas');
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to fetch cinemas');
  },

  // Lấy lịch chiếu theo rạp
  getCinemaShowtimes: async (cinemaId: number, date?: string): Promise<Showtime[]> => {
    const url = date 
      ? `/cinemas/${cinemaId}/showtimes?date=${date}`
      : `/cinemas/${cinemaId}/showtimes`;
    const response = await api.get(url);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to fetch cinema showtimes');
  },

  // Lấy đánh giá phim
  getMovieReviews: async (movieId: number): Promise<Review[]> => {
    const response = await api.get(`/movies/${movieId}/reviews`);
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to fetch reviews');
  },

  // Thêm đánh giá
  addReview: async (movieId: number, rating: number, comment: string): Promise<Review> => {
    const response = await api.post(`/movies/${movieId}/reviews`, {
      rating,
      comment,
    });
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to add review');
  },

  // Thêm vào yêu thích
  addToFavourites: async (movieId: number): Promise<Favourite> => {
    const response = await api.post('/favourites', { movieId });
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to add to favourites');
  },

  // Xóa khỏi yêu thích
  removeFromFavourites: async (movieId: number): Promise<void> => {
    const response = await api.delete(`/favourites/${movieId}`);
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Failed to remove from favourites');
    }
  },

  // Lấy danh sách yêu thích
  getFavourites: async (): Promise<Favourite[]> => {
    const response = await api.get('/favourites');
    if (response.data.code === 200) {
      return response.data.result;
    }
    throw new Error(response.data.message || 'Failed to fetch favourites');
  },
};
