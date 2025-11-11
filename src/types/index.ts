// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Movie Types
export interface Movie {
  id: number;
  title: string;
  description?: string;
  duration: number;
  releaseDate: string;
  endDate?: string;
  genre?: string;
  director?: string;
  cast?: string;
  rating?: number;
  language?: string;
  subtitle?: string;
  ageRating?: string;
  posterUrl?: string;
  trailerUrl?: string;
  active?: boolean;
}

// Cinema Types
export interface Cinema {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  description: string;
  imageUrl?: string;
}

export interface CinemaHall {
  id: number;
  cinemaId: number;
  hallName: string;
  totalSeats: number;
}

// Showtime Types
export interface Showtime {
  id: number;
  movieId: number;
  cinemaHallId: number;
  showDate: string;
  startTime: string;
  endTime: string;
  price: number;
  movie?: Movie;
  cinemaHall?: CinemaHall;
}

// Seat Types
export interface Seat {
  id: number;
  cinemaHallId: number;
  seatNumber: string;
  seatRow: string;
  seatType: 'NORMAL' | 'VIP';
}

// Booking Types
export interface Booking {
  id: number;
  userId: number;
  showtimeId: number;
  totalAmount: number;
  bookingDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  seats: BookingSeat[];
  user?: User;
  showtime?: Showtime;
}

export interface BookingSeat {
  id: number;
  bookingId: number;
  seatId: number;
  seat?: Seat;
}

// Review Types
export interface Review {
  id: number;
  userId: number;
  movieId: number;
  rating: number;
  comment: string;
  isApproved: boolean;
  user?: User;
  movie?: Movie;
}

// Favourite Types
export interface Favourite {
  id: number;
  userId: number;
  movieId: number;
  movie?: Movie;
}

// Promotion Types
export interface Promotion {
  id: number;
  code?: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
