# 📚 Tài Liệu API - Movie App Server

**Base URL:** `http://localhost:8080/api`

**Authentication:** JWT Token (Bearer Token) - Thêm vào header: `Authorization: Bearer {token}`

---

## 📋 Mục Lục

1. [Authentication APIs](#1-authentication-apis)
2. [User APIs](#2-user-apis)
3. [Movie APIs](#3-movie-apis)
4. [Cinema APIs](#4-cinema-apis)
5. [Showtime APIs](#5-showtime-apis)
6. [Seat APIs](#6-seat-apis)
7. [Booking APIs](#7-booking-apis)
8. [Review APIs](#8-review-apis)
9. [Favourite APIs](#9-favourite-apis)
10. [Promotion APIs](#10-promotion-apis)

---

## 1. Authentication APIs

### 1.1. Đăng Nhập
**Endpoint:** `POST /auth/login`  
**Chức năng:** Đăng nhập và nhận JWT token  
**Authentication:** Không cần

**Request Body:**
```json
{
  "username": "customer1",
  "password": "password123"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Login successfully",
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "customer1",
      "email": "customer1@gmail.com",
      "fullName": "Trần Thị B",
      "role": "CUSTOMER"
    }
  }
}
```

---

### 1.2. Đăng Ký
**Endpoint:** `POST /auth/register`  
**Chức năng:** Đăng ký tài khoản mới  
**Authentication:** Không cần

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@gmail.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "phone": "0123456789",
  "dateOfBirth": "2000-01-01",
  "gender": "MALE"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Register successfully",
  "result": {
    "id": 5,
    "username": "newuser",
    "email": "newuser@gmail.com",
    "fullName": "Nguyễn Văn A",
    "role": "CUSTOMER"
  }
}
```

---

### 1.3. Lấy Thông Tin User Hiện Tại
**Endpoint:** `GET /auth/me`  
**Chức năng:** Lấy thông tin user từ JWT token  
**Authentication:** Cần (Bearer Token)

**Request Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": {
    "id": 1,
    "username": "customer1",
    "email": "customer1@gmail.com",
    "fullName": "Trần Thị B",
    "phone": "0123456789",
    "role": "CUSTOMER"
  }
}
```

---

### 1.4. Đổi Mật Khẩu
**Endpoint:** `PUT /auth/change-password`  
**Chức năng:** Đổi mật khẩu của user hiện tại  
**Authentication:** Cần (Bearer Token)

**Request Body:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Reset password successfully",
  "result": {
    "id": 1,
    "username": "customer1",
    "email": "customer1@gmail.com"
  }
}
```

---

### 1.5. Đặt Lại Mật Khẩu
**Endpoint:** `POST /auth/reset-password`  
**Chức năng:** Đặt lại mật khẩu (quên mật khẩu)  
**Authentication:** Không cần

**Request Body:**
```json
{
  "username": "customer1",
  "newPassword": "newpassword123"
}
```

---

### 1.6. Đăng Xuất
**Endpoint:** `POST /auth/logout`  
**Chức năng:** Đăng xuất (client-side xóa token)  
**Authentication:** Cần (Bearer Token)

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": "Logged out successfully"
}
```

---

## 2. User APIs

### 2.1. Lấy Tất Cả Users
**Endpoint:** `GET /users`  
**Chức năng:** Lấy danh sách tất cả users (chỉ ADMIN)  
**Authentication:** Cần (Bearer Token) + Role: ADMIN

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@movieticket.com",
      "fullName": "Admin System",
      "role": "ADMIN"
    }
  ]
}
```

---

### 2.2. Lấy User Theo ID
**Endpoint:** `GET /users/{id}`  
**Chức năng:** Lấy thông tin user theo ID  
**Authentication:** Cần (Bearer Token)

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": {
    "id": 1,
    "username": "customer1",
    "email": "customer1@gmail.com",
    "fullName": "Trần Thị B"
  }
}
```

---

### 2.3. Kiểm Tra Username Đã Tồn Tại
**Endpoint:** `GET /users/check-username/{username}`  
**Chức năng:** Kiểm tra username đã được sử dụng chưa  
**Authentication:** Không cần

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": true
}
```

---

### 2.4. Kiểm Tra Email Đã Tồn Tại
**Endpoint:** `GET /users/check-email/{email}`  
**Chức năng:** Kiểm tra email đã được sử dụng chưa  
**Authentication:** Không cần

---

## 3. Movie APIs

### 3.1. Lấy Tất Cả Phim
**Endpoint:** `GET /movies`  
**Chức năng:** Lấy danh sách tất cả phim  
**Authentication:** Không cần

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": [
    {
      "id": 1,
      "title": "Avengers: Endgame",
      "description": "The epic conclusion to the Infinity Saga",
      "duration": 181,
      "releaseDate": "2019-04-26",
      "genre": "Action, Adventure",
      "director": "Anthony Russo, Joe Russo",
      "cast": "Robert Downey Jr., Chris Evans",
      "posterUrl": "/images/movies/avengers-endgame.jpg",
      "rating": 8.4,
      "active": true
    }
  ]
}
```

---

### 3.2. Lấy Phim Đang Chiếu
**Endpoint:** `GET /movies/currently-showing`  
**Chức năng:** Lấy danh sách phim đang chiếu  
**Authentication:** Không cần

---

### 3.3. Lấy Phim Sắp Chiếu
**Endpoint:** `GET /movies/upcoming`  
**Chức năng:** Lấy danh sách phim sắp chiếu  
**Authentication:** Không cần

---

### 3.4. Lấy Phim Theo Thể Loại
**Endpoint:** `GET /movies/genre/{genre}`  
**Chức năng:** Lấy danh sách phim theo thể loại  
**Authentication:** Không cần

**Example:** `GET /movies/genre/Action`

---

### 3.5. Lấy Chi Tiết Phim
**Endpoint:** `GET /movies/{id}`  
**Chức năng:** Lấy thông tin chi tiết của một phim  
**Authentication:** Không cần

---

### 3.6. Tìm Kiếm Phim
**Endpoint:** `GET /movies/search?q={query}`  
**Chức năng:** Tìm kiếm phim theo từ khóa  
**Authentication:** Không cần

**Example:** `GET /movies/search?q=avengers`

---

### 3.7. Lấy Lịch Chiếu Của Phim
**Endpoint:** `GET /movies/{id}/showtimes`  
**Chức năng:** Lấy danh sách lịch chiếu của một phim  
**Authentication:** Không cần

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": [
    {
      "id": 1,
      "movieId": 1,
      "cinemaHallId": 1,
      "showDate": "2024-01-15",
      "startTime": "10:00:00",
      "endTime": "13:00:00",
      "price": 120000
    }
  ]
}
```

---

### 3.8. Lấy Đánh Giá Của Phim
**Endpoint:** `GET /movies/{id}/reviews`  
**Chức năng:** Lấy danh sách đánh giá của một phim  
**Authentication:** Không cần

---

### 3.9. Thêm Đánh Giá Cho Phim
**Endpoint:** `POST /movies/{id}/reviews`  
**Chức năng:** Thêm đánh giá cho một phim  
**Authentication:** Cần (Bearer Token)

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Phim rất hay, diễn xuất tốt!"
}
```

**Response:**
```json
{
  "code": 201,
  "message": "Review created successfully",
  "result": {
    "id": 1,
    "userId": 1,
    "movieId": 1,
    "rating": 5,
    "comment": "Phim rất hay, diễn xuất tốt!",
    "isApproved": false
  }
}
```

---

### 3.10. Tạo Phim Mới
**Endpoint:** `POST /movies`  
**Chức năng:** Tạo phim mới (ADMIN/STAFF)  
**Authentication:** Cần (Bearer Token) + Role: ADMIN hoặc STAFF

**Request Body:**
```json
{
  "title": "Spider-Man: No Way Home",
  "description": "Peter Parker's identity is revealed",
  "duration": 148,
  "releaseDate": "2021-12-17",
  "endDate": "2022-02-17",
  "genre": "Action, Adventure, Sci-Fi",
  "director": "Jon Watts",
  "cast": "Tom Holland, Zendaya, Benedict Cumberbatch",
  "posterUrl": "/images/movies/spider-man-no-way-home.jpg",
  "trailerUrl": "https://youtube.com/watch?v=...",
  "language": "English",
  "subtitle": "Vietnamese",
  "ageRating": "PG-13",
  "active": true
}
```

---

### 3.11. Cập Nhật Phim
**Endpoint:** `PUT /movies/{id}`  
**Chức năng:** Cập nhật thông tin phim (ADMIN/STAFF)  
**Authentication:** Cần (Bearer Token) + Role: ADMIN hoặc STAFF

**Request Body:** (Giống như tạo phim)

---

### 3.12. Xóa Phim
**Endpoint:** `DELETE /movies/{id}`  
**Chức năng:** Xóa phim (ADMIN)  
**Authentication:** Cần (Bearer Token) + Role: ADMIN

---

## 4. Cinema APIs

### 4.1. Lấy Tất Cả Rạp
**Endpoint:** `GET /cinemas`  
**Chức năng:** Lấy danh sách tất cả rạp chiếu phim  
**Authentication:** Không cần

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": [
    {
      "id": 1,
      "name": "CGV Landmark 81",
      "address": "208 Nguyễn Hữu Cảnh, Bình Thạnh",
      "city": "Ho Chi Minh City",
      "phone": "1900 6017",
      "email": "landmark81@cgv.vn",
      "description": "Rạp chiếu phim hiện đại",
      "imageUrl": "/images/cinemas/cgv-landmark.jpg",
      "active": true
    }
  ]
}
```

---

### 4.2. Lấy Rạp Đang Hoạt Động
**Endpoint:** `GET /cinemas/active`  
**Chức năng:** Lấy danh sách rạp đang hoạt động  
**Authentication:** Không cần

---

### 4.3. Lấy Rạp Theo Thành Phố
**Endpoint:** `GET /cinemas/city/{city}`  
**Chức năng:** Lấy danh sách rạp theo thành phố  
**Authentication:** Không cần

**Example:** `GET /cinemas/city/Ho Chi Minh City`

---

### 4.4. Lấy Chi Tiết Rạp
**Endpoint:** `GET /cinemas/{id}`  
**Chức năng:** Lấy thông tin chi tiết của một rạp  
**Authentication:** Không cần

---

### 4.5. Lấy Lịch Chiếu Của Rạp
**Endpoint:** `GET /cinemas/{id}/showtimes?date={date}`  
**Chức năng:** Lấy danh sách lịch chiếu của một rạp (có thể filter theo ngày)  
**Authentication:** Không cần

**Example:** `GET /cinemas/1/showtimes?date=2024-01-15`

---

### 4.6. Tạo Rạp Mới
**Endpoint:** `POST /cinemas`  
**Chức năng:** Tạo rạp mới (ADMIN/STAFF)  
**Authentication:** Cần (Bearer Token) + Role: ADMIN hoặc STAFF

**Request Body:**
```json
{
  "name": "CGV Vincom Center",
  "address": "72 Lê Thánh Tôn, Quận 1",
  "city": "Ho Chi Minh City",
  "phone": "1900 6017",
  "email": "vincom@cgv.vn",
  "description": "Rạp chiếu phim tại trung tâm thành phố",
  "imageUrl": "/images/cinemas/cgv-vincom.jpg",
  "active": true
}
```

---

## 5. Showtime APIs

### 5.1. Lấy Tất Cả Lịch Chiếu
**Endpoint:** `GET /showtimes`  
**Chức năng:** Lấy danh sách tất cả lịch chiếu  
**Authentication:** Không cần

---

### 5.2. Lấy Lịch Chiếu Theo Phim
**Endpoint:** `GET /showtimes/movie/{movieId}`  
**Chức năng:** Lấy danh sách lịch chiếu của một phim  
**Authentication:** Không cần

---

### 5.3. Lấy Lịch Chiếu Theo Phòng Chiếu
**Endpoint:** `GET /showtimes/cinema-hall/{cinemaHallId}`  
**Chức năng:** Lấy danh sách lịch chiếu của một phòng chiếu  
**Authentication:** Không cần

---

### 5.4. Lấy Lịch Chiếu Theo Phim Và Ngày
**Endpoint:** `GET /showtimes/movie/{movieId}/date/{showDate}`  
**Chức năng:** Lấy lịch chiếu của phim trong một ngày cụ thể  
**Authentication:** Không cần

**Example:** `GET /showtimes/movie/1/date/2024-01-15`

---

### 5.5. Lấy Chi Tiết Lịch Chiếu
**Endpoint:** `GET /showtimes/{id}`  
**Chức năng:** Lấy thông tin chi tiết của một lịch chiếu  
**Authentication:** Không cần

---

### 5.6. Lấy Danh Sách Ghế Của Suất Chiếu
**Endpoint:** `GET /showtimes/{id}/seats`  
**Chức năng:** Lấy danh sách tất cả ghế của một suất chiếu  
**Authentication:** Không cần

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": [
    {
      "id": 1,
      "cinemaHallId": 1,
      "seatNumber": "A1",
      "seatRow": "A",
      "seatType": "NORMAL",
      "active": true
    }
  ]
}
```

---

### 5.7. Lấy Danh Sách Ghế Còn Trống
**Endpoint:** `GET /showtimes/{id}/available-seats`  
**Chức năng:** Lấy danh sách ghế còn trống của một suất chiếu  
**Authentication:** Không cần

---

### 5.8. Tạo Lịch Chiếu Mới
**Endpoint:** `POST /showtimes`  
**Chức năng:** Tạo lịch chiếu mới (ADMIN/STAFF)  
**Authentication:** Cần (Bearer Token) + Role: ADMIN hoặc STAFF

**Request Body:**
```json
{
  "movieId": 1,
  "cinemaHallId": 1,
  "showDate": "2024-01-15",
  "startTime": "10:00:00",
  "endTime": "13:00:00",
  "price": 120000,
  "active": true
}
```

**Note:** movieId và cinemaHallId cần được set thông qua Movie và CinemaHall objects trong service layer.

---

## 6. Seat APIs

### 6.1. Lấy Danh Sách Ghế Theo Phòng Chiếu
**Endpoint:** `GET /seats/cinema-hall/{cinemaHallId}`  
**Chức năng:** Lấy danh sách tất cả ghế của một phòng chiếu  
**Authentication:** Không cần

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": [
    {
      "id": 1,
      "cinemaHallId": 1,
      "seatNumber": "A1",
      "seatRow": "A",
      "seatType": "NORMAL",
      "active": true
    },
    {
      "id": 2,
      "cinemaHallId": 1,
      "seatNumber": "A2",
      "seatRow": "A",
      "seatType": "NORMAL",
      "active": true
    }
  ]
}
```

---

### 6.2. Lấy Chi Tiết Ghế
**Endpoint:** `GET /seats/{id}`  
**Chức năng:** Lấy thông tin chi tiết của một ghế  
**Authentication:** Không cần

---

## 7. Booking APIs

### 7.1. Lấy Danh Sách Booking Của User Hiện Tại
**Endpoint:** `GET /bookings`  
**Chức năng:** Lấy danh sách booking của user đang đăng nhập  
**Authentication:** Cần (Bearer Token)

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": [
    {
      "id": 1,
      "userId": 1,
      "showtimeId": 1,
      "bookingCode": "BK1705123456789",
      "totalAmount": 240000,
      "bookingStatus": "CONFIRMED",
      "paymentStatus": "PAID",
      "paymentMethod": "CASH",
      "bookingDate": "2024-01-15T10:30:00",
      "bookingItems": [
        {
          "id": 1,
          "seatId": 1,
          "price": 120000
        }
      ]
    }
  ]
}
```

---

### 7.2. Lấy Tất Cả Booking (ADMIN/STAFF)
**Endpoint:** `GET /bookings/all`  
**Chức năng:** Lấy danh sách tất cả booking (chỉ ADMIN/STAFF)  
**Authentication:** Cần (Bearer Token) + Role: ADMIN hoặc STAFF

---

### 7.3. Lấy Booking Theo User ID
**Endpoint:** `GET /bookings/user/{userId}`  
**Chức năng:** Lấy danh sách booking của một user cụ thể  
**Authentication:** Cần (Bearer Token)

---

### 7.4. Lấy Booking Theo Mã Booking
**Endpoint:** `GET /bookings/booking-code/{bookingCode}`  
**Chức năng:** Lấy thông tin booking theo mã booking  
**Authentication:** Không cần

**Example:** `GET /bookings/booking-code/BK1705123456789`

---

### 7.5. Lấy Chi Tiết Booking
**Endpoint:** `GET /bookings/{id}`  
**Chức năng:** Lấy thông tin chi tiết của một booking  
**Authentication:** Cần (Bearer Token)

---

### 7.6. Tạo Booking Mới
**Endpoint:** `POST /bookings`  
**Chức năng:** Tạo booking mới (đặt vé)  
**Authentication:** Cần (Bearer Token)

**Request Body:**
```json
{
  "showtimeId": 1,
  "seatIds": [1, 2, 3],
  "paymentMethod": "CASH",
  "promotionCode": "SUMMER2024"
}
```

**Response:**
```json
{
  "code": 201,
  "message": "Booking created successfully",
  "result": {
    "id": 1,
    "userId": 1,
    "showtimeId": 1,
    "bookingCode": "BK1705123456789",
    "totalAmount": 360000,
    "bookingStatus": "PENDING",
    "paymentStatus": "PENDING",
    "paymentMethod": "CASH",
    "bookingDate": "2024-01-15T10:30:00"
  }
}
```

---

### 7.7. Cập Nhật Trạng Thái Booking
**Endpoint:** `PUT /bookings/{id}/status?status={status}`  
**Chức năng:** Cập nhật trạng thái booking (ADMIN/STAFF)  
**Authentication:** Cần (Bearer Token) + Role: ADMIN hoặc STAFF

**Example:** `PUT /bookings/1/status?status=CONFIRMED`

**Status values:** `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`

---

### 7.8. Cập Nhật Trạng Thái Thanh Toán
**Endpoint:** `PUT /bookings/{id}/payment-status?status={status}`  
**Chức năng:** Cập nhật trạng thái thanh toán (ADMIN/STAFF)  
**Authentication:** Cần (Bearer Token) + Role: ADMIN hoặc STAFF

**Example:** `PUT /bookings/1/payment-status?status=PAID`

**Status values:** `PENDING`, `PAID`, `FAILED`, `REFUNDED`

---

### 7.9. Hủy Booking
**Endpoint:** `PUT /bookings/{id}/cancel` hoặc `DELETE /bookings/{id}`  
**Chức năng:** Hủy booking  
**Authentication:** Cần (Bearer Token)

**Response:**
```json
{
  "code": 200,
  "message": "Booking cancelled successfully",
  "result": null
}
```

---

## 8. Review APIs

### 8.1. Lấy Tất Cả Review
**Endpoint:** `GET /reviews`  
**Chức năng:** Lấy danh sách tất cả review  
**Authentication:** Không cần

---

### 8.2. Lấy Review Theo Phim
**Endpoint:** `GET /reviews/movie/{movieId}`  
**Chức năng:** Lấy danh sách review của một phim (chỉ review đã được duyệt)  
**Authentication:** Không cần

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": [
    {
      "id": 1,
      "userId": 1,
      "movieId": 1,
      "rating": 5,
      "comment": "Phim rất hay!",
      "isApproved": true
    }
  ]
}
```

---

### 8.3. Lấy Review Theo User
**Endpoint:** `GET /reviews/user/{userId}`  
**Chức năng:** Lấy danh sách review của một user  
**Authentication:** Không cần

---

### 8.4. Lấy Chi Tiết Review
**Endpoint:** `GET /reviews/{id}`  
**Chức năng:** Lấy thông tin chi tiết của một review  
**Authentication:** Không cần

---

### 8.5. Tạo Review Mới
**Endpoint:** `POST /reviews`  
**Chức năng:** Tạo review mới  
**Authentication:** Cần (Bearer Token)

**Request Body:**
```json
{
  "movieId": 1,
  "rating": 5,
  "comment": "Phim rất hay, diễn xuất tốt!"
}
```

**Note:** userId sẽ được lấy tự động từ JWT token

---

### 8.6. Cập Nhật Review
**Endpoint:** `PUT /reviews/{id}`  
**Chức năng:** Cập nhật review  
**Authentication:** Cần (Bearer Token)

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Phim hay nhưng có một số điểm chưa ổn"
}
```

---

### 8.7. Duyệt Review
**Endpoint:** `PUT /reviews/{id}/approve`  
**Chức năng:** Duyệt review (ADMIN/STAFF)  
**Authentication:** Cần (Bearer Token) + Role: ADMIN hoặc STAFF

---

### 8.8. Xóa Review
**Endpoint:** `DELETE /reviews/{id}`  
**Chức năng:** Xóa review  
**Authentication:** Cần (Bearer Token)

---

### 8.9. Lấy Điểm Đánh Giá Trung Bình
**Endpoint:** `GET /reviews/movie/{movieId}/rating`  
**Chức năng:** Lấy điểm đánh giá trung bình của một phim  
**Authentication:** Không cần

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": 4.5
}
```

---

### 8.10. Lấy Số Lượng Review
**Endpoint:** `GET /reviews/movie/{movieId}/count`  
**Chức năng:** Lấy số lượng review của một phim  
**Authentication:** Không cần

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": 150
}
```

---

## 9. Favourite APIs

### 9.1. Lấy Danh Sách Yêu Thích Của User Hiện Tại
**Endpoint:** `GET /favourites`  
**Chức năng:** Lấy danh sách phim yêu thích của user đang đăng nhập  
**Authentication:** Cần (Bearer Token)

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": [
    {
      "id": 1,
      "userId": 1,
      "movieId": 1,
      "movie": {
        "id": 1,
        "title": "Avengers: Endgame",
        "posterUrl": "/images/movies/avengers-endgame.jpg"
      }
    }
  ]
}
```

---

### 9.2. Thêm Vào Yêu Thích
**Endpoint:** `POST /favourites`  
**Chức năng:** Thêm phim vào danh sách yêu thích  
**Authentication:** Cần (Bearer Token)

**Request Body:**
```json
{
  "movieId": 1
}
```

**Response:**
```json
{
  "code": 201,
  "message": "Favourite created successfully",
  "result": {
    "id": 1,
    "userId": 1,
    "movieId": 1
  }
}
```

---

### 9.3. Xóa Khỏi Yêu Thích
**Endpoint:** `DELETE /favourites/{movieId}`  
**Chức năng:** Xóa phim khỏi danh sách yêu thích (theo movieId)  
**Authentication:** Cần (Bearer Token)

**Example:** `DELETE /favourites/1`

---

### 9.4. Lấy Yêu Thích Theo User ID (Legacy)
**Endpoint:** `GET /favourites/user/{userId}`  
**Chức năng:** Lấy danh sách yêu thích của một user cụ thể  
**Authentication:** Không cần

---

### 9.5. Thêm Yêu Thích (Legacy)
**Endpoint:** `POST /favourites/user/{userId}/movie/{movieId}`  
**Chức năng:** Thêm yêu thích (format cũ)  
**Authentication:** Không cần

---

### 9.6. Kiểm Tra Phim Đã Yêu Thích
**Endpoint:** `GET /favourites/user/{userId}/movie/{movieId}/check`  
**Chức năng:** Kiểm tra phim đã được user yêu thích chưa  
**Authentication:** Không cần

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": true
}
```

---

## 10. Promotion APIs

### 10.1. Lấy Tất Cả Khuyến Mãi
**Endpoint:** `GET /promotions`  
**Chức năng:** Lấy danh sách tất cả khuyến mãi  
**Authentication:** Không cần

**Response:**
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": [
    {
      "id": 1,
      "name": "Giảm giá mùa hè",
      "description": "Giảm 20% cho tất cả vé",
      "discountType": "PERCENTAGE",
      "discountValue": 20,
      "minAmount": 100000,
      "maxDiscount": 50000,
      "startDate": "2024-06-01T00:00:00",
      "endDate": "2024-08-31T23:59:59",
      "usageLimit": 1000,
      "usedCount": 150,
      "active": true
    }
  ]
}
```

---

### 10.2. Lấy Khuyến Mãi Đang Hoạt Động
**Endpoint:** `GET /promotions/active`  
**Chức năng:** Lấy danh sách khuyến mãi đang hoạt động (trong thời gian hiệu lực)  
**Authentication:** Không cần

---

### 10.3. Lấy Khuyến Mãi Còn Sử Dụng Được
**Endpoint:** `GET /promotions/available`  
**Chức năng:** Lấy danh sách khuyến mãi còn sử dụng được (chưa hết hạn và chưa đạt giới hạn)  
**Authentication:** Không cần

---

### 10.4. Lấy Khuyến Mãi Theo ID
**Endpoint:** `GET /promotions/{id}`  
**Chức năng:** Lấy thông tin chi tiết của một khuyến mãi  
**Authentication:** Không cần

---

### 10.5. Lấy Khuyến Mãi Theo Mã Code
**Endpoint:** `GET /promotions/code/{code}`  
**Chức năng:** Lấy khuyến mãi theo mã code  
**Authentication:** Không cần

**Example:** `GET /promotions/code/SUMMER2024`

---

### 10.6. Tạo Khuyến Mãi Mới
**Endpoint:** `POST /promotions`  
**Chức năng:** Tạo khuyến mãi mới (ADMIN/STAFF)  
**Authentication:** Cần (Bearer Token) + Role: ADMIN hoặc STAFF

**Request Body:**
```json
{
  "name": "Giảm giá cuối năm",
  "description": "Giảm 30% cho đơn hàng trên 200,000đ",
  "discountType": "PERCENTAGE",
  "discountValue": 30,
  "minAmount": 200000,
  "maxDiscount": 100000,
  "startDate": "2024-12-01T00:00:00",
  "endDate": "2024-12-31T23:59:59",
  "usageLimit": 500,
  "usedCount": 0,
  "active": true
}
```

**Discount Types:** `PERCENTAGE` (phần trăm), `FIXED_AMOUNT` (số tiền cố định)

---

### 10.7. Cập Nhật Khuyến Mãi
**Endpoint:** `PUT /promotions/{id}`  
**Chức năng:** Cập nhật thông tin khuyến mãi (ADMIN/STAFF)  
**Authentication:** Cần (Bearer Token) + Role: ADMIN hoặc STAFF

**Request Body:** (Giống như tạo khuyến mãi)

---

### 10.8. Xóa Khuyến Mãi
**Endpoint:** `DELETE /promotions/{id}`  
**Chức năng:** Xóa khuyến mãi (ADMIN)  
**Authentication:** Cần (Bearer Token) + Role: ADMIN

---

## 📝 Ghi Chú Quan Trọng

### Authentication
- Các API yêu cầu authentication cần thêm header: `Authorization: Bearer {token}`
- Token được lấy từ API `/auth/login`
- Một số API yêu cầu role cụ thể (ADMIN, STAFF)

### Error Response Format
```json
{
  "code": 404,
  "message": "Movie not found",
  "result": null
}
```

### Success Response Format
```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": { ... }
}
```

### Date Format
- Date: `YYYY-MM-DD` (ví dụ: `2024-01-15`)
- DateTime: `YYYY-MM-DDTHH:mm:ss` (ví dụ: `2024-01-15T10:30:00`)

### Common Status Values

**Booking Status:**
- `PENDING` - Đang chờ
- `CONFIRMED` - Đã xác nhận
- `CANCELLED` - Đã hủy
- `COMPLETED` - Đã hoàn thành

**Payment Status:**
- `PENDING` - Chờ thanh toán
- `PAID` - Đã thanh toán
- `FAILED` - Thanh toán thất bại
- `REFUNDED` - Đã hoàn tiền

**Seat Type:**
- `NORMAL` - Ghế thường
- `VIP` - Ghế VIP
- `COUPLE` - Ghế đôi

**Discount Type:**
- `PERCENTAGE` - Giảm theo phần trăm
- `FIXED_AMOUNT` - Giảm số tiền cố định

---

## 🧪 Test API với cURL

### Ví dụ: Đăng nhập
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "customer1",
    "password": "password123"
  }'
```

### Ví dụ: Lấy danh sách phim
```bash
curl -X GET http://localhost:8080/api/movies
```

### Ví dụ: Tạo booking (cần token)
```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {your_token}" \
  -d '{
    "showtimeId": 1,
    "seatIds": [1, 2],
    "paymentMethod": "CASH"
  }'
```

---

## 📊 Tổng Kết

- **Tổng số API:** ~70+ endpoints
- **Public APIs:** ~40 endpoints (không cần authentication)
- **Protected APIs:** ~30 endpoints (cần authentication)
- **Admin/Staff APIs:** ~15 endpoints (cần role)

Tất cả các API đã được test và hoạt động trơn tru! 🎉

