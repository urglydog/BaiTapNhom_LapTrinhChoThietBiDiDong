# 🎬 Tài Liệu Xây Dựng Tính Năng Đặt Vé Xem Phim

## 📋 Tổng Quan

Tài liệu này mô tả chi tiết quá trình xây dựng luồng đặt vé xem phim trong ứng dụng Movie Ticket Booking, bao gồm 3 màn hình chính:

1. **Movie Detail** (Chi tiết phim) - Hiển thị thông tin phim và nút "Mua vé"
2. **Showtime Selection** (Chọn lịch chiếu) - Chọn ngày, rạp, và giờ chiếu
3. **Seat Selection** (Chọn ghế) - Chọn ghế ngồi và xác nhận đặt vé

---

## 🏗️ Kiến Trúc Hệ Thống

### Backend (Spring Boot)
```
be/BaiTapNhom_LapTrinhChoThietBiDiDong_Server/
├── model/
│   ├── Movie.java           # Entity phim
│   ├── Cinema.java          # Entity rạp chiếu
│   ├── CinemaHall.java      # Entity phòng chiếu
│   ├── Showtime.java        # Entity suất chiếu
│   ├── Seat.java            # Entity ghế
│   └── Booking.java         # Entity đặt vé
├── controller/
│   ├── MovieController.java
│   ├── CinemaController.java
│   ├── ShowtimeController.java
│   └── BookingController.java
└── service/
    └── [Các service tương ứng]
```

### Frontend (React Native + Expo)
```
fe/BaiTapNhom_LapTrinhChoThietBiDiDong/
├── app/
│   ├── movie-detail.tsx          # Màn hình chi tiết phim
│   ├── showtime-selection.tsx    # Màn hình chọn lịch chiếu
│   └── seat-selection.tsx        # Màn hình chọn ghế
├── src/
│   ├── types/
│   │   └── index.ts              # Định nghĩa TypeScript types
│   └── services/
│       ├── api.ts                # Cấu hình axios
│       ├── movieService.ts       # Service gọi API phim
│       ├── showtimeService.ts    # Service gọi API lịch chiếu
│       ├── cinemaService.ts      # Service gọi API rạp
│       └── bookingService.ts     # Service gọi API đặt vé
```

---

## 🔧 Chi Tiết Xây Dựng

### 1. Cập Nhật Types (TypeScript)

**File:** `src/types/index.ts`

#### Các Interface Chính:

```typescript
// Showtime Types
interface Showtime {
  id: number;
  movieId: number;
  cinemaHallId: number;
  showDate: string;
  startTime: string;
  endTime: string;
  price: number;
  active?: boolean;
  movie?: Movie;
  cinemaHall?: CinemaHall;
}

interface ShowtimeWithCinema extends Showtime {
  cinema?: Cinema;
}

// Seat Types
interface Seat {
  id: number;
  cinemaHallId: number;
  seatNumber: string;
  seatRow: string;
  seatType: 'NORMAL' | 'VIP' | 'COUPLE';
  active?: boolean;
}

interface SeatWithStatus extends Seat {
  isBooked: boolean;
  isSelected?: boolean;
}

// Booking Types
interface CreateBookingRequest {
  showtimeId: number;
  seatIds: number[];
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER';
  promotionCode?: string;
}
```

**Mục đích:**
- Định nghĩa kiểu dữ liệu chặt chẽ cho TypeScript
- Đảm bảo type safety khi làm việc với API
- Hỗ trợ autocomplete trong IDE
- Mở rộng các interface để phục vụ UI (VD: `SeatWithStatus`)

---

### 2. Xây Dựng Services

#### 2.1. Showtime Service

**File:** `src/services/showtimeService.ts`

**Các API chính:**

```typescript
export const showtimeService = {
  // Lấy lịch chiếu theo phim và ngày
  getShowtimesByMovieAndDate(movieId: number, showDate: string): Promise<ShowtimeWithCinema[]>
  
  // Lấy tất cả lịch chiếu của phim
  getShowtimesByMovie(movieId: number): Promise<Showtime[]>
  
  // Lấy chi tiết suất chiếu
  getShowtimeById(showtimeId: number): Promise<Showtime>
  
  // Lấy danh sách ghế còn trống
  getAvailableSeats(showtimeId: number): Promise<Seat[]>
  
  // Lấy tất cả ghế (bao gồm đã đặt)
  getAllSeats(showtimeId: number): Promise<Seat[]>
  
  // Lấy ghế với trạng thái đặt
  getSeatsWithStatus(showtimeId: number): Promise<SeatWithStatus[]>
}
```

**Đặc điểm:**
- Gọi API backend thông qua axios instance đã config
- Xử lý lỗi và throw message phù hợp
- Kết hợp nhiều API call để tạo dữ liệu phong phú (VD: lấy cả thông tin cinema cho showtime)
- So sánh available seats vs all seats để đánh dấu ghế đã đặt

#### 2.2. Cinema Service

**File:** `src/services/cinemaService.ts`

**Các API chính:**

```typescript
export const cinemaService = {
  getAllCinemas(): Promise<Cinema[]>
  getActiveCinemas(): Promise<Cinema[]>
  getCinemaById(cinemaId: number): Promise<Cinema>
  getCinemasByCity(city: string): Promise<Cinema[]>
  getCinemaHallById(hallId: number): Promise<CinemaHall>
}
```

**Mục đích:**
- Hỗ trợ lấy thông tin rạp chiếu và phòng chiếu
- Filter rạp theo thành phố hoặc trạng thái hoạt động

---

### 3. Màn Hình Movie Detail

**File:** `app/movie-detail.tsx`

#### Thay Đổi Chính:

**Thêm nút "Mua vé":**

```tsx
<TouchableOpacity
    style={styles.buyTicketButton}
    onPress={() => router.push(`/showtime-selection?movieId=${movie.id}`)}
>
    <Text style={styles.buyTicketButtonText}>Mua vé</Text>
</TouchableOpacity>
```

**Styling:**

```typescript
buyTicketButton: {
    backgroundColor: '#E91E63',  // Màu hồng nổi bật
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,  // Shadow cho Android
}
```

**Chức năng:**
- Hiển thị đầy đủ thông tin phim (poster, rating, duration, description, cast, director, etc.)
- Nút "Xem Trailer" để mở URL trailer
- Nút "Mua vé" dẫn đến màn hình chọn lịch chiếu với movieId

---

### 4. Màn Hình Showtime Selection

**File:** `app/showtime-selection.tsx`

#### Cấu Trúc Component:

```tsx
ShowtimeSelectionScreen
├── Header (Movie title + Back button)
├── Date Selector (Horizontal scrollable dates)
├── Showtimes List
│   └── Cinema Section (For each cinema)
│       ├── Cinema Header (Name + Address)
│       └── Showtime Grid (Time buttons)
└── Loading/Error States
```

#### Các State Chính:

```typescript
const [movie, setMovie] = useState<Movie | null>(null);
const [showtimesByDate, setShowtimesByDate] = useState<ShowtimesByDate>({});
const [selectedDate, setSelectedDate] = useState<string>('');
const [availableDates, setAvailableDates] = useState<string[]>([]);
const [isLoading, setIsLoading] = useState(true);
```

#### Luồng Hoạt Động:

1. **Load dữ liệu ban đầu:**
   ```typescript
   useEffect(() => {
       loadMovieAndShowtimes();
   }, [movieId]);
   ```

2. **Generate danh sách ngày (7 ngày tiếp theo):**
   ```typescript
   const dates: string[] = [];
   const today = new Date();
   for (let i = 0; i < 7; i++) {
       const date = new Date(today);
       date.setDate(today.getDate() + i);
       dates.push(date.toISOString().split('T')[0]);
   }
   ```

3. **Load showtimes theo ngày được chọn:**
   ```typescript
   const loadShowtimesForDate = async (date: string) => {
       const showtimes = await showtimeService.getShowtimesByMovieAndDate(
           Number(movieId),
           date
       );
       
       // Group by cinema
       const grouped = {};
       showtimes.forEach((showtime) => {
           if (showtime.cinema) {
               const cinemaId = showtime.cinema.id;
               if (!grouped[cinemaId]) {
                   grouped[cinemaId] = {
                       cinema: showtime.cinema,
                       showtimes: [],
                   };
               }
               grouped[cinemaId].showtimes.push(showtime);
           }
       });
       
       setShowtimesByDate((prev) => ({
           ...prev,
           [date]: grouped,
       }));
   };
   ```

4. **Hiển thị lịch chiếu theo rạp:**
   - Mỗi rạp có một section riêng
   - Hiển thị tên rạp, địa chỉ
   - Các giờ chiếu được sắp xếp thành grid
   - Hiển thị cả giờ bắt đầu và giờ kết thúc

5. **Chọn suất chiếu:**
   ```typescript
   const handleShowtimeSelect = (showtimeId: number) => {
       router.push(`/seat-selection?showtimeId=${showtimeId}`);
   };
   ```

#### Giao Diện:

**Date Selector:**
- Hiển thị 7 ngày tiếp theo theo chiều ngang
- Ngày được chọn có background màu hồng (#E91E63)
- Format: "19/11" + "H.nay" hoặc "Thứ 5"

**Cinema Section:**
- Card trắng với shadow nhẹ
- Header: Tên rạp (bold) + địa chỉ (gray)
- Label "2D Phụ đề" màu hồng
- Grid các nút giờ chiếu với border màu hồng

**Showtime Button:**
- Border màu hồng, background trắng
- Hiển thị giờ bắt đầu (bold) và giờ kết thúc (nhỏ, gray)
- VD: "20:00" và "~22:31"

---

### 5. Màn Hình Seat Selection

**File:** `app/seat-selection.tsx`

#### Cấu Trúc Component:

```tsx
SeatSelectionScreen
├── Header (Showtime info + Back button)
├── Screen indicator (Màn hình phim)
├── Seats Grid
│   └── Seat Rows (A, B, C, ...)
│       └── Individual Seats
├── Legend (Chú thích màu ghế)
└── Footer (Summary + Book button)
```

#### Các State Chính:

```typescript
const [showtime, setShowtime] = useState<Showtime | null>(null);
const [seats, setSeats] = useState<SeatWithStatus[]>([]);
const [selectedSeats, setSelectedSeats] = useState<SeatWithStatus[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isBooking, setIsBooking] = useState(false);
```

#### Luồng Hoạt Động:

1. **Load dữ liệu suất chiếu và ghế:**
   ```typescript
   const loadShowtimeAndSeats = async () => {
       // Load showtime info
       const showtimeData = await showtimeService.getShowtimeById(showtimeId);
       setShowtime(showtimeData);

       // Load seats with booking status
       const seatsData = await showtimeService.getSeatsWithStatus(showtimeId);
       setSeats(seatsData);
   };
   ```

2. **Xử lý chọn ghế:**
   ```typescript
   const handleSeatPress = (seat: SeatWithStatus) => {
       // Không cho chọn ghế đã đặt
       if (seat.isBooked) {
           Alert.alert('Thông báo', 'Ghế này đã được đặt');
           return;
       }

       // Toggle select/deselect
       const isSelected = selectedSeats.some((s) => s.id === seat.id);
       if (isSelected) {
           setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
       } else {
           setSelectedSeats([...selectedSeats, seat]);
       }
   };
   ```

3. **Group ghế theo hàng:**
   ```typescript
   const seatsByRow = seats.reduce((acc, seat) => {
       if (!acc[seat.seatRow]) {
           acc[seat.seatRow] = [];
       }
       acc[seat.seatRow].push(seat);
       return acc;
   }, {} as Record<string, SeatWithStatus[]>);
   
   const rows = Object.keys(seatsByRow).sort();
   ```

4. **Xác định màu ghế:**
   ```typescript
   const getSeatColor = (seat: SeatWithStatus) => {
       if (seat.isBooked) return '#D3D3D3';      // Xám - đã đặt
       if (selectedSeats.some(s => s.id === seat.id)) 
           return '#E91E63';                      // Hồng - đang chọn
       if (seat.seatType === 'VIP') return '#FFD700';      // Vàng - VIP
       if (seat.seatType === 'COUPLE') return '#FF69B4';   // Hồng nhạt - Couple
       return '#4CAF50';                          // Xanh - Thường
   };
   ```

5. **Xử lý đặt vé:**
   ```typescript
   const handleBooking = async () => {
       if (selectedSeats.length === 0) {
           Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một ghế');
           return;
       }

       Alert.alert(
           'Xác nhận đặt vé',
           `Bạn có chắc muốn đặt ${selectedSeats.length} ghế?\nTổng tiền: ${formatPrice(totalAmount)}`,
           [
               { text: 'Hủy', style: 'cancel' },
               { text: 'Đồng ý', onPress: () => confirmBooking() },
           ]
       );
   };

   const confirmBooking = async () => {
       const seatIds = selectedSeats.map((seat) => seat.id);
       
       const booking = await bookingService.createBooking({
           showtimeId: Number(showtimeId),
           seatIds,
           paymentMethod: 'CASH',
       });

       Alert.alert(
           'Đặt vé thành công!',
           `Mã đặt vé: ${booking.bookingCode}\nVui lòng thanh toán tại quầy trước giờ chiếu.`,
           [{ text: 'OK', onPress: () => router.push('/booking') }]
       );
   };
   ```

#### Giao Diện:

**Screen Indicator:**
- Thanh ngang màu hồng ở giữa màn hình
- Text "MÀN HÌNH" ở dưới
- Giúp người dùng định hướng hàng ghế

**Seat Grid:**
- Mỗi hàng có label (A, B, C, ...)
- Ghế hiển thị trong grid với khoảng cách đều
- Ghế hình vuông 36x36 với border radius 6
- Hiển thị số ghế (loại bỏ chữ hàng)

**Legend:**
- 4 loại ghế với màu tương ứng:
  - Ghế thường (xanh)
  - Ghế VIP (vàng)
  - Ghế đang chọn (hồng)
  - Đã đặt (xám)

**Footer:**
- Tạm tính: Số ghế + Tổng tiền
- Nút "Tiếp tục" màu hồng
- Disable khi chưa chọn ghế
- Hiển thị loading indicator khi đang đặt vé

---

## 🔄 Luồng Hoạt Động Tổng Thể

```
1. Movie Detail Screen
   │
   ├─> Xem thông tin phim (poster, rating, description, etc.)
   ├─> Xem trailer (nếu có)
   └─> Click "Mua vé"
       │
       ▼
2. Showtime Selection Screen
   │
   ├─> Load danh sách lịch chiếu của phim
   ├─> Chọn ngày chiếu (7 ngày tiếp theo)
   ├─> Xem các rạp có lịch chiếu
   ├─> Xem giờ chiếu của từng rạp
   └─> Click chọn một giờ chiếu
       │
       ▼
3. Seat Selection Screen
   │
   ├─> Load sơ đồ ghế của suất chiếu
   ├─> Xem trạng thái ghế (trống/đã đặt)
   ├─> Chọn ghế muốn đặt
   ├─> Xem tổng tiền tạm tính
   ├─> Click "Tiếp tục"
   ├─> Xác nhận đặt vé
   └─> Nhận mã đặt vé
       │
       ▼
4. Booking Success
   │
   └─> Chuyển đến màn hình booking history
```

---

## 🎨 Thiết Kế UI/UX

### Color Scheme
- **Primary:** #E91E63 (Pink) - Nút chính, highlight
- **Success:** #4CAF50 (Green) - Ghế thường
- **Warning:** #FFD700 (Gold) - Ghế VIP
- **Disabled:** #D3D3D3 (Gray) - Ghế đã đặt
- **Background:** #f5f5f5 (Light Gray)
- **Text Primary:** #333 (Dark Gray)
- **Text Secondary:** #666 (Medium Gray)

### Typography
- **Header:** 20px, Bold
- **Title:** 18px, Bold
- **Body:** 16px, Regular
- **Caption:** 14px, Regular
- **Small:** 12px, Regular

### Spacing
- **Container Padding:** 16px
- **Section Margin:** 24px
- **Element Margin:** 12px
- **Button Padding:** 16px vertical

### Components
- **Border Radius:** 8-12px
- **Shadow:** elevation: 2-5
- **Touch Feedback:** opacity: 0.7

---

## 🔌 API Endpoints Sử Dụng

### Showtime APIs

```
GET /api/showtimes/movie/{movieId}
GET /api/showtimes/movie/{movieId}/date/{showDate}
GET /api/showtimes/{id}
GET /api/showtimes/{id}/seats
GET /api/showtimes/{id}/available-seats
```

### Cinema APIs

```
GET /api/cinemas
GET /api/cinemas/{id}
GET /api/cinema-halls/{id}
```

### Movie APIs

```
GET /api/movies/{id}
```

### Booking APIs

```
POST /api/bookings
GET /api/bookings
GET /api/bookings/booking-code/{bookingCode}
```

---

## 📊 Data Models

### Showtime
```typescript
{
  id: number;
  movieId: number;
  cinemaHallId: number;
  showDate: "2024-11-19";        // Format: YYYY-MM-DD
  startTime: "20:00:00";         // Format: HH:mm:ss
  endTime: "22:31:00";
  price: 120000;                 // VND
  active: true;
}
```

### Seat
```typescript
{
  id: number;
  cinemaHallId: number;
  seatNumber: "A1";
  seatRow: "A";
  seatType: "NORMAL" | "VIP" | "COUPLE";
  active: true;
  isBooked: false;               // Computed field
  isSelected: false;             // UI state
}
```

### Booking Request
```typescript
{
  showtimeId: number;
  seatIds: [1, 2, 3];
  paymentMethod: "CASH";
  promotionCode: "SUMMER2024";   // Optional
}
```

### Booking Response
```typescript
{
  id: number;
  userId: number;
  showtimeId: number;
  bookingCode: "BK1705123456789";
  totalAmount: 360000;
  bookingStatus: "PENDING";
  paymentStatus: "PENDING";
  paymentMethod: "CASH";
  bookingDate: "2024-11-19T10:30:00";
  bookingItems: [
    {
      id: number;
      seatId: number;
      price: 120000;
    }
  ];
}
```

---

## ⚡ Performance Optimization

### Caching Strategy
- Cache showtimes by date để tránh gọi API lại khi user quay lại ngày đã xem
- Sử dụng `useState` object để lưu `showtimesByDate[date]`

### Loading States
- Hiển thị ActivityIndicator khi load data
- Disable buttons khi đang xử lý
- Hiển thị skeleton screens (có thể cải thiện thêm)

### Error Handling
- Try-catch cho mọi API call
- Hiển thị Alert với message lỗi rõ ràng
- Fallback UI khi không có data

---

## 🐛 Error Handling

### Common Errors

**1. Network Error:**
```typescript
try {
    const data = await showtimeService.getShowtimes();
} catch (error: any) {
    Alert.alert('Lỗi mạng', 'Vui lòng kiểm tra kết nối internet');
}
```

**2. No Data Found:**
```typescript
if (!movie) {
    return (
        <View style={styles.centerContainer}>
            <Text>Không tìm thấy phim</Text>
            <TouchableOpacity onPress={() => router.back()}>
                <Text>Quay lại</Text>
            </TouchableOpacity>
        </View>
    );
}
```

**3. Seat Already Booked:**
```typescript
if (seat.isBooked) {
    Alert.alert('Thông báo', 'Ghế này đã được đặt');
    return;
}
```

**4. Booking Failed:**
```typescript
try {
    await bookingService.createBooking(request);
} catch (error: any) {
    Alert.alert('Lỗi', error.message || 'Không thể đặt vé');
}
```

---

## 🔒 Security Considerations

### Authentication
- Sử dụng JWT token trong header: `Authorization: Bearer {token}`
- Token được lưu trong AsyncStorage
- Auto refresh khi hết hạn (trong interceptor)

### Data Validation
- Validate input trước khi gọi API
- Check selectedSeats.length > 0 trước khi đặt vé
- Validate showtimeId và movieId từ URL params

### API Security
- Backend validation cho booking request
- Check seat availability trước khi confirm
- Transaction để đảm bảo không double booking

---

## 🧪 Testing Scenarios

### Manual Testing Checklist

**Movie Detail Screen:**
- [ ] Hiển thị đầy đủ thông tin phim
- [ ] Poster load đúng
- [ ] Nút "Xem Trailer" hoạt động
- [ ] Nút "Mua vé" dẫn đến màn hình đúng

**Showtime Selection Screen:**
- [ ] Load đúng 7 ngày tiếp theo
- [ ] Chọn ngày cập nhật lịch chiếu
- [ ] Hiển thị đúng tên rạp và địa chỉ
- [ ] Giờ chiếu hiển thị đúng format
- [ ] Click giờ chiếu dẫn đến seat selection

**Seat Selection Screen:**
- [ ] Sơ đồ ghế hiển thị đúng
- [ ] Ghế đã đặt có màu xám và không click được
- [ ] Chọn ghế cập nhật màu và tổng tiền
- [ ] Bỏ chọn ghế hoạt động đúng
- [ ] Không cho đặt vé khi chưa chọn ghế
- [ ] Đặt vé thành công hiển thị mã booking

---

## 🚀 Future Improvements

### Short Term
1. **Payment Integration:**
   - Tích hợp cổng thanh toán (Momo, VNPay)
   - Thanh toán online trước khi confirm booking

2. **Seat Type Pricing:**
   - Giá khác nhau cho ghế VIP, Couple
   - Hiển thị giá cho từng loại ghế

3. **Promotion Code:**
   - Input field để nhập mã khuyến mãi
   - Validate và apply discount

### Medium Term
4. **Cinema Map:**
   - Hiển thị map với location của rạp
   - Tính khoảng cách từ vị trí hiện tại

5. **Filter & Sort:**
   - Filter theo city, cinema chain
   - Sort theo giá, khoảng cách, rating

6. **Review System:**
   - Xem review của phim
   - Thêm review sau khi xem

### Long Term
7. **Recommendation:**
   - Gợi ý phim dựa trên lịch sử
   - Collaborative filtering

8. **Social Features:**
   - Share booking với bạn bè
   - Book cùng nhóm

9. **AR Seat Preview:**
   - Xem góc nhìn từ ghế bằng AR

---

## 📝 Code Conventions

### Naming Conventions
- **Components:** PascalCase (VD: `SeatSelectionScreen`)
- **Files:** kebab-case (VD: `seat-selection.tsx`)
- **Functions:** camelCase (VD: `handleSeatPress`)
- **Constants:** UPPER_SNAKE_CASE (VD: `API_BASE_URL`)

### File Structure
```typescript
// 1. Imports
import React, { useEffect, useState } from 'react';
import { View, Text, ... } from 'react-native';
import { useRouter } from 'expo-router';

// 2. Interfaces/Types
interface Props { ... }

// 3. Component
export default function ComponentName() {
    // 3.1. Hooks
    const router = useRouter();
    const [state, setState] = useState();
    
    // 3.2. Effects
    useEffect(() => { ... }, []);
    
    // 3.3. Handlers
    const handleAction = () => { ... };
    
    // 3.4. Render
    return (...);
}

// 4. Styles
const styles = StyleSheet.create({ ... });
```

### Comments
```typescript
// Good: Describe WHY, not WHAT
// Group seats by row to display in grid format
const seatsByRow = seats.reduce(...);

// Avoid: Obvious comments
// Set loading to true
setIsLoading(true);
```

---

## 📚 References

### Documentation
- [React Native Docs](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Axios](https://axios-http.com/docs/intro)
- [TypeScript](https://www.typescriptlang.org/docs/)

### Backend API
- [API Documentation](../API_DOCUMENTATION.md)
- Spring Boot REST API với JWT authentication

### Design Inspiration
- [Tiki](https://tiki.vn/) - E-commerce design patterns
- [CGV](https://www.cgv.vn/) - Cinema booking flow
- [Galaxy Cinema](https://www.galaxycine.vn/) - Seat selection UI

---

## 👥 Team & Contributors

**Developers:**
- Frontend: React Native + Expo + TypeScript
- Backend: Spring Boot + JPA + MySQL
- Database: Thiết kế schema cho cinema booking

**Tools Used:**
- VS Code + GitHub Copilot
- Postman (API testing)
- Git + GitHub

---

## 📞 Support & Contact

Nếu có vấn đề hoặc câu hỏi về implementation:
1. Check API Documentation trước
2. Review code comments
3. Test với Postman để isolate frontend/backend issues
4. Check console logs và error messages

---

**Last Updated:** November 19, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
