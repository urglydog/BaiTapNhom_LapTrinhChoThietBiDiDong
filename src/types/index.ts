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

// OTP Types
export interface SendOtpRequest {
  email?: string;
  phone?: string;
  type: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD';
}

export interface VerifyOtpRequest {
  email?: string;
  phone?: string;
  otp: string;
  type: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD';
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn?: number; // thời gian hết hạn OTP (giây)
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token?: string; // token tạm thời nếu verify thành công
  user?: User; // user info nếu verify cho login/register
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
  price?: number; // Optional vì có thể lấy từ seat
  movie?: Movie;
  cinemaHall?: CinemaHall;
}

// Showtime với thông tin cinema
export interface ShowtimeWithCinema extends Showtime {
  cinema?: Cinema;
}

// Seat Types
export interface Seat {
  id: number;
  cinemaHallId: number;
  seatNumber: string;
  seatRow: string;
  seatType: 'NORMAL' | 'VIP' | 'COUPLE';
  price?: number; // Giá ghế (nếu có)
  basePrice?: number;
}

// Seat với trạng thái đặt
export interface SeatWithStatus extends Seat {
  isBooked: boolean;
  isSelected?: boolean;
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
  usedCount?: number;
  active?: boolean;
}

// OTP Types
export interface SendOtpRequest {
  email?: string;
  phone?: string;
  type: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD';
}

export interface VerifyOtpRequest {
  email?: string;
  phone?: string;
  otp: string;
  type: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD';
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn?: number; // thời gian hết hạn OTP (giây)
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token?: string; // token tạm thời nếu verify thành công
  user?: User; // user info nếu verify cho login/register
}

// Register Request (match với backend)
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
}

// Register Request (match với backend)
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
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
