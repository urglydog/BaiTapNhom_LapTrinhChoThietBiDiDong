# Luồng đặt vé xem phim - Hướng dẫn sử dụng

## 📁 Cấu trúc file đã tạo

### 1. **Services** (src/services/)
- `api.ts` - Cấu hình axios, interceptor, base URL
- `movieService.ts` - API calls cho phim
- `showtimeService.ts` - API calls cho lịch chiếu và ghế
- `cinemaService.ts` - API calls cho rạp chiếu

### 2. **Screens** (app/)
- `movie-detail.tsx` - Chi tiết phim + nút "Mua vé"
- `showtime-selection.tsx` - Chọn ngày, rạp, giờ chiếu
- `seat-selection.tsx` - Chọn ghế ngồi

### 3. **Types** (src/types/index.ts)
- Định nghĩa tất cả interfaces: Movie, Showtime, Cinema, Seat...

---

## 🎬 Luồng hoạt động chi tiết

### **Bước 1: Xem chi tiết phim** (`movie-detail.tsx`)

**Chức năng:**
- Hiển thị poster, tên phim, mô tả, thời lượng, thể loại, đạo diễn, diễn viên
- Nút "Xem trailer" (mở YouTube/link trailer)
- Nút "Mua vé" (màu hồng #E91E63)

**Flow:**
```
User click phim → movie-detail.tsx
  ↓
Gọi movieService.getMovieById(movieId)
  ↓
Hiển thị thông tin phim
  ↓
User click "Mua vé" 
  ↓
Navigate → showtime-selection với params: {movieId, movieTitle}
```

**Code chính:**
```typescript
const handleBuyTicket = () => {
  router.push({
    pathname: '/showtime-selection',
    params: {
      movieId: movie.id,
      movieTitle: movie.title,
    },
  });
};
```

---

### **Bước 2: Chọn lịch chiếu** (`showtime-selection.tsx`)

**Chức năng:**
- Scroll ngang chọn ngày (7 ngày tiếp theo, bắt đầu từ TEST_START_DATE)
- Hiển thị danh sách rạp
- Mỗi rạp hiển thị các giờ chiếu available (grid layout)
- Click giờ chiếu → chuyển sang chọn ghế

**Flow:**
```
Nhận params: movieId, movieTitle
  ↓
Load movie info: movieService.getMovieById()
  ↓
Tạo 7 ngày từ TEST_START_DATE (2023-01-15)
  ↓
User chọn ngày
  ↓
Gọi API: showtimeService.getShowtimesByMovieAndDate(movieId, date)
  ↓
Backend trả về: [{id, movieId, cinemaHallId, showDate, startTime, endTime, price}]
  ↓
Lấy thông tin cinema: cinemaService.getAllCinemas()
  ↓
Map cinemaHallId → Cinema để hiển thị tên rạp
  ↓
Group showtimes theo Cinema
  ↓
Hiển thị từng Cinema + giờ chiếu
  ↓
User click giờ chiếu
  ↓
Navigate → seat-selection với params: {
  showtimeId, movieTitle, cinemaName, hallName, showDate, showTime, price
}
```

**Constant quan trọng:**
```typescript
const TEST_START_DATE = new Date("2023-01-15"); // Thay đổi để test với data khác
```

**Code xử lý group showtimes:**
```typescript
const groupShowtimesByCinema = () => {
  const grouped: { [cinemaName: string]: ShowtimeWithCinema[] } = {};
  
  showtimes.forEach((showtime) => {
    const cinema = cinemas.find(c => 
      c.cinemaHalls?.some(h => h.id === showtime.cinemaHallId)
    );
    const cinemaName = cinema?.name || 'Unknown Cinema';
    
    if (!grouped[cinemaName]) {
      grouped[cinemaName] = [];
    }
    grouped[cinemaName].push({
      ...showtime,
      cinema,
      cinemaHall: cinema?.cinemaHalls?.find(h => h.id === showtime.cinemaHallId)
    });
  });
  
  return grouped;
};
```

---

### **Bước 3: Chọn ghế** (`seat-selection.tsx`)

**Chức năng:**
- Hiển thị màn hình (label "MÀN HÌNH")
- Sơ đồ ghế theo hàng A, B, C... (mỗi chữ cái 1 dòng)
- Màu ghế:
  - Tím nhạt (#E6D5F5): Ghế thường available
  - Hồng nhạt (#FFB3BA): Ghế VIP/COUPLE
  - Hồng đậm (#E91E63): Ghế đang chọn
  - Đen + icon person: Ghế đã đặt
- Ghế COUPLE: chiều rộng gấp đôi (68px)
- Legend (chú thích màu)
- Footer: Tạm tính (số ghế + tổng tiền) + nút "Tiếp tục"

**Flow:**
```
Nhận params: showtimeId, movieTitle, cinemaName, hallName, showDate, showTime, price
  ↓
Load seats: showtimeService.getSeatsWithStatus(showtimeId)
  ↓
Backend logic:
  1. Lấy tất cả seats của cinemaHall: /showtimes/{id}/seats
  2. Lấy available seats: /showtimes/{id}/available-seats
  3. So sánh để đánh dấu isBooked
  ↓
Frontend nhận: [{
  id, cinemaHallId, seatNumber, seatRow, seatType, 
  basePrice?, isBooked, isSelected
}]
  ↓
Group seats theo seatRow (A, B, C...)
  ↓
Sort seats trong mỗi row theo seatNumber
  ↓
Render từng row:
  - Label: A, B, C...
  - Seats: A1, A2, A3... (hoặc A1-A2 cho COUPLE)
  ↓
User click ghế:
  - Nếu isBooked → Alert "Ghế đã được đặt"
  - Nếu chưa chọn → Thêm vào selectedSeats[]
  - Nếu đã chọn → Remove khỏi selectedSeats[]
  ↓
Tính tổng tiền:
  totalPrice = selectedSeats.reduce((sum, seatId) => {
    seat = seats.find(s => s.id === seatId)
    return sum + (seat.price || showtimePrice)
  }, 0)
  ↓
User click "Tiếp tục"
  ↓
Navigate → /booking với params đầy đủ
```

**Code logic chính:**

```typescript
// Group by row (A, B, C...)
const groupSeatsByRow = () => {
  const grouped: { [key: string]: SeatWithStatus[] } = {};
  
  seats.forEach((seat) => {
    const row = seat.seatRow; // A, B, C...
    if (!row) return;
    if (!grouped[row]) grouped[row] = [];
    grouped[row].push(seat);
  });

  // Sort seats by number
  Object.keys(grouped).forEach((row) => {
    grouped[row].sort((a, b) => 
      parseInt(a.seatNumber) - parseInt(b.seatNumber)
    );
  });

  return grouped;
};

// Calculate total price
const calculateTotal = () => {
  return selectedSeats.reduce((total, seatId) => {
    const seat = seats.find((s) => s.id === seatId);
    const seatPrice = seat?.price || Number(price) || 0;
    return total + seatPrice;
  }, 0);
};

// Render seat with COUPLE support
{groupedSeats[row].map((seat) => {
  const isCouple = seat.seatType === "COUPLE";
  return (
    <TouchableOpacity
      style={[
        styles.seat,
        isCouple && styles.coupleSeat, // Width: 68px
        { backgroundColor: getSeatColor(seat) },
      ]}
      onPress={() => handleSeatPress(seat)}
      disabled={seat.isBooked}
    >
      {seat.isBooked ? (
        <Ionicons name="person" size={16} color="#fff" />
      ) : (
        <Text>{seat.seatNumber}</Text>
      )}
    </TouchableOpacity>
  );
})}
```

---

## 🔧 API Endpoints sử dụng

### Movies
- `GET /api/movies/{id}` - Chi tiết phim

### Showtimes
- `GET /api/showtimes/movie/{movieId}/date/{showDate}` - Lấy lịch chiếu theo phim + ngày
  - Format date: `yyyy-MM-dd` (VD: "2023-01-15")
  - Response: `ApiResponse<Showtime[]>`

### Seats
- `GET /api/showtimes/{showtimeId}/seats` - Tất cả ghế của phòng chiếu
- `GET /api/showtimes/{showtimeId}/available-seats` - Ghế còn trống

### Cinemas
- `GET /api/cinemas` - Tất cả rạp (có cinemaHalls)

---

## 🎨 Màu sắc theme

```typescript
const COLORS = {
  primary: '#E91E63',        // Hồng đậm (buttons, selected seats)
  normalSeat: '#E6D5F5',     // Tím nhạt (ghế thường)
  vipSeat: '#FFB3BA',        // Hồng nhạt (VIP/COUPLE)
  bookedSeat: '#000000',     // Đen (ghế đã đặt)
  screen: '#E91E63',         // Hồng (màn hình)
  background: '#fff',
  textPrimary: '#333',
  textSecondary: '#666',
  border: '#eee',
};
```

---

## ⚙️ Cấu hình quan trọng

### API Base URL (src/services/api.ts)
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
// Đổi thành URL backend của bạn
```

### Test Date (app/showtime-selection.tsx)
```typescript
const TEST_START_DATE = new Date("2023-01-15");
// Đổi để test với data khác trong database
```

---

## 🐛 Debugging

### Kiểm tra console logs:
```typescript
// showtime-selection.tsx
console.log("📋 Showtimes API response:", response);
console.log("🎬 Grouped showtimes:", groupedShowtimes);

// seat-selection.tsx
console.log("🪑 Loading seats for showtime:", showtimeId);
console.log("📊 Total seats loaded:", seatsData.length);
console.log("🔍 Seat row info:", {seatRow, seatNumber, price});
```

### Kiểm tra lỗi thường gặp:
1. **Empty showtimes array**: 
   - Kiểm tra `TEST_START_DATE` có khớp với data trong DB không
   - Kiểm tra API URL trong `api.ts`
   - Xem console log response từ backend

2. **Ghế không hiển thị đúng hàng**:
   - Kiểm tra `seatRow` có giá trị A, B, C... (không phải number)
   - Xem log: `console.log("🔍 Seat row info:", seatsData[0])`

3. **Giá tiền = 0đ**:
   - Backend không trả về `basePrice` cho seat
   - Hoặc `price` từ showtime params bị undefined
   - Check: `seat?.price || Number(price) || 0`

---

## ✅ Checklist triển khai

- [x] api.ts - Axios config
- [x] movieService.ts - Movie APIs
- [x] showtimeService.ts - Showtime & Seat APIs  
- [x] cinemaService.ts - Cinema APIs
- [x] movie-detail.tsx - Chi tiết phim + nút Mua vé
- [x] showtime-selection.tsx - Chọn ngày/rạp/giờ
- [x] seat-selection.tsx - Chọn ghế (A, B, C... layout)
- [x] Types đầy đủ trong src/types/index.ts
- [ ] booking.tsx - Màn hình xác nhận đặt vé (chưa có)

---

## 📝 Ghi chú

### Điểm khác biệt so với yêu cầu ban đầu:
1. ✅ Ghế sắp xếp theo **seatRow** (A, B, C...) thay vì rowNumber
2. ✅ Ghế COUPLE có width gấp đôi
3. ✅ Header seat-selection hiển thị đầy đủ: phim, rạp, phòng, ngày, giờ
4. ✅ Tính tiền từ `seat.price` (nếu có) hoặc `showtime.price`
5. ✅ Màu sắc theo sample image: tím nhạt (normal), hồng nhạt (VIP)

### Cần bổ sung:
- Màn hình `/booking` để hoàn tất đặt vé
- Tích hợp payment methods
- Lưu booking history

---

Chúc bạn code thành công! 🎉
