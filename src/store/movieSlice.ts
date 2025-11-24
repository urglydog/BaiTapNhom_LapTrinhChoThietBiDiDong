import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { movieService } from '../services/movieService';
import { Movie, Showtime, Cinema, Review, Favourite } from '../types';

interface MovieState {
  movies: Movie[];
  currentMovie: Movie | null;
  showtimes: Showtime[];
  cinemas: Cinema[];
  reviews: Review[];
  favourites: Favourite[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: MovieState = {
  movies: [],
  currentMovie: null,
  showtimes: [],
  cinemas: [],
  reviews: [],
  favourites: [],
  isLoading: false,
  error: null,
  searchQuery: '',
};

// Async thunks
export const fetchMovies = createAsyncThunk(
  'movie/fetchMovies',
  async (params: { page?: number; size?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await movieService.getMovies(params.page, params.size);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch movies');
    }
  }
);

export const fetchMovieById = createAsyncThunk(
  'movie/fetchMovieById',
  async (id: number, { rejectWithValue }) => {
    try {
      const movie = await movieService.getMovieById(id);
      return movie;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch movie');
    }
  }
);

export const searchMovies = createAsyncThunk(
  'movie/searchMovies',
  async (query: string, { rejectWithValue }) => {
    try {
      const movies = await movieService.searchMovies(query);
      return { movies, query };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchShowtimes = createAsyncThunk(
  'movie/fetchShowtimes',
  async (movieId: number, { rejectWithValue }) => {
    try {
      const showtimes = await movieService.getMovieShowtimes(movieId);
      return showtimes;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch showtimes');
    }
  }
);

export const fetchCinemas = createAsyncThunk(
  'movie/fetchCinemas',
  async (_, { rejectWithValue }) => {
    try {
      const cinemas = await movieService.getCinemas();
      return cinemas;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cinemas');
    }
  }
);

export const fetchReviews = createAsyncThunk(
  'movie/fetchReviews',
  async (movieId: number, { rejectWithValue }) => {
    try {
      const reviews = await movieService.getMovieReviews(movieId);
      return reviews;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const addReview = createAsyncThunk(
  'movie/addReview',
  async (params: { movieId: number; rating: number; comment: string }, { rejectWithValue }) => {
    try {
      const review = await movieService.addReview(params.movieId, params.rating, params.comment);
      return review;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add review');
    }
  }
);

export const fetchFavourites = createAsyncThunk(
  'movie/fetchFavourites',
  async (_, { rejectWithValue }) => {
    try {
      const favourites = await movieService.getFavourites();
      return favourites;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch favourites');
    }
  }
);

export const toggleFavourite = createAsyncThunk(
  'movie/toggleFavourite',
  async (movieId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { movie: MovieState };
      const isFavourite = state.movie.favourites.some(fav => fav.movieId === movieId);
      
      if (isFavourite) {
        await movieService.removeFromFavourites(movieId);
        return { movieId, action: 'remove' };
      } else {
        const favourite = await movieService.addToFavourites(movieId);
        return { favourite, action: 'add' };
      }
    } catch (error: any) {
      // Trả về message lỗi cụ thể từ service
      const errorMessage = error?.message || error?.response?.data?.message || 'Không thể cập nhật yêu thích. Vui lòng thử lại.';
      console.error('Toggle favourite error:', error);
      return rejectWithValue(errorMessage);
    }
  }
);

const movieSlice = createSlice({
  name: 'movie',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.movies = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch movies
      .addCase(fetchMovies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.movies = action.payload.content || action.payload;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch movie by ID
      .addCase(fetchMovieById.fulfilled, (state, action) => {
        state.currentMovie = action.payload;
      })
      // Search movies
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.movies = action.payload.movies;
        state.searchQuery = action.payload.query;
      })
      // Fetch showtimes
      .addCase(fetchShowtimes.fulfilled, (state, action) => {
        state.showtimes = action.payload;
      })
      // Fetch cinemas
      .addCase(fetchCinemas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCinemas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cinemas = action.payload;
      })
      .addCase(fetchCinemas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch reviews
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.reviews = action.payload;
      })
      // Add review
      .addCase(addReview.fulfilled, (state, action) => {
        state.reviews.push(action.payload);
      })
      // Fetch favourites
      .addCase(fetchFavourites.fulfilled, (state, action) => {
        state.favourites = action.payload;
      })
      // Toggle favourite
      .addCase(toggleFavourite.fulfilled, (state, action) => {
        if (action.payload.action === 'add') {
          state.favourites.push(action.payload.favourite);
        } else {
          state.favourites = state.favourites.filter(fav => fav.movieId !== action.payload.movieId);
        }
      })
      .addCase(toggleFavourite.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSearchQuery, clearSearch } = movieSlice.actions;
export default movieSlice.reducer;
