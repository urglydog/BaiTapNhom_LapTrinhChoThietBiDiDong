import api from './api';
import { Movie, Showtime, Cinema, Review, Favourite } from '../types';

export const movieService = {
  // Lấy danh sách phim
  getMovies: async (): Promise<Movie[]> => {
    try {
      const response = await api.get('/movies');
      console.log('📡 API Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.code === 200 && Array.isArray(response.data.result)) {
        const movies = response.data.result;
        
        // Hàm normalize title để so sánh
        const normalizeTitle = (title: string): string => {
          if (!title) return '';
          return title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ') // Loại bỏ khoảng trắng thừa
            .replace(/[^\w\s]/g, '') // Loại bỏ ký tự đặc biệt
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // Loại bỏ dấu tiếng Việt
        };
        
        // Bước 1: Loại bỏ duplicate dựa trên ID (ưu tiên ID lớn hơn - record mới hơn)
        const moviesById = new Map<number, Movie>();
        for (const movie of movies) {
          if (!movie || !movie.id) continue;
          
          const existing = moviesById.get(movie.id);
          if (!existing || movie.id > existing.id) {
            moviesById.set(movie.id, movie);
          }
        }
        
        // Bước 2: Loại bỏ duplicate dựa trên title (normalize)
        const moviesByTitle = new Map<string, Movie>();
        const uniqueMovies: Movie[] = [];
        
        for (const movie of Array.from(moviesById.values())) {
          if (!movie.title) continue;
          
          const normalizedTitle = normalizeTitle(movie.title);
          const existing = moviesByTitle.get(normalizedTitle);
          
          if (!existing) {
            // Chưa có phim với title này
            moviesByTitle.set(normalizedTitle, movie);
            uniqueMovies.push(movie);
          } else {
            // Đã có phim với title này, so sánh để giữ phim tốt hơn
            // Ưu tiên: 1. Có posterUrl, 2. active = true, 3. ID lớn hơn
            const currentHasPoster = !!movie.posterUrl;
            const existingHasPoster = !!existing.posterUrl;
            const currentIsActive = movie.active !== false;
            const existingIsActive = existing.active !== false;
            
            if (
              (currentHasPoster && !existingHasPoster) ||
              (currentHasPoster === existingHasPoster && currentIsActive && !existingIsActive) ||
              (currentHasPoster === existingHasPoster && currentIsActive === existingIsActive && movie.id > existing.id)
            ) {
              // Thay thế phim cũ bằng phim mới tốt hơn
              const index = uniqueMovies.findIndex(m => m.id === existing.id);
              if (index !== -1) {
                uniqueMovies[index] = movie;
                moviesByTitle.set(normalizedTitle, movie);
              }
            }
          }
        }
        
        // Sắp xếp theo ID (hoặc releaseDate nếu có)
        uniqueMovies.sort((a, b) => {
          if (a.releaseDate && b.releaseDate) {
            return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
          }
          return b.id - a.id;
        });
        
        console.log(`✅ Loaded ${uniqueMovies.length} unique movies from ${movies.length} total (removed ${movies.length - uniqueMovies.length} duplicates)`);
        
        if (uniqueMovies.length > 0) {
          console.log('📋 Sample movies:', uniqueMovies.slice(0, 3).map(m => ({
            id: m.id,
            title: m.title,
            hasPoster: !!m.posterUrl,
          })));
        }
        
        return uniqueMovies;
      }
      
      console.warn('⚠️ API response format unexpected:', response.data);
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching movies:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      throw new Error(error.response?.data?.message || 'Không thể tải danh sách phim');
    }
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
