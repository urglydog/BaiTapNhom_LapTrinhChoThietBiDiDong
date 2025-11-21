# 🐛 Debug Guide - Showtime Selection Screen

## Vấn Đề Hiện Tại

### 1. Màn hình lịch chiếu trống (không hiển thị dữ liệu)
### 2. Lỗi dependencies: `expo` và `expo-modules-core`

---

## ✅ Các Bước Đã Thực Hiện

### 1. Fix Dependencies
```bash
npm install expo expo-modules-core
```

### 2. Xóa Cache và Restart Metro
```bash
# Xóa cache
Remove-Item -Path .expo -Recurse -Force

# Restart với clear cache
npx expo start --clear
```

### 3. Cập Nhật showtime Service với Logging

Đã thêm console.log chi tiết ở các bước:
- Fetching showtimes
- API response structure
- Cinema mapping
- Final result

---

## 🔍 Kiểm Tra Backend

### Điểm Quan Trọng

**Showtime Model có `@JsonBackReference` trên `cinemaHall`:**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "cinema_hall_id", nullable = false)
@JsonBackReference  // <-- Không serialize trong JSON response
private CinemaHall cinemaHall;
```

**Điều này có nghĩa:**
- API `/showtimes/movie/{id}/date/{date}` sẽ KHÔNG trả về thông tin `cinemaHall`
- Chỉ có `cinemaHallId` (số) trong response
- Frontend cần tự fetch thông tin cinema

---

## 📝 Cấu Trúc API Response

### Expected Response từ `/api/showtimes/movie/1/date/2025-11-20`:

```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": [
    {
      "id": 1,
      "movieId": 1,
      "cinemaHallId": 1,  // <-- CHỈ CÓ ID, KHÔNG CÓ OBJECT
      "showDate": "2025-11-20",
      "startTime": "10:00:00",
      "endTime": "12:00:00",
      "price": 120000,
      "active": true
    }
  ]
}
```

### Expected Response từ `/api/cinemas`:

```json
{
  "code": 200,
  "message": "Data fetched successfully",
  "result": [
    {
      "id": 1,
      "name": "CGV Landmark 81",
      "address": "208 Nguyễn Hữu Cảnh",
      "city": "Ho Chi Minh City",
      "phone": "1900 6017",
      "email": "landmark81@cgv.vn",
      "active": true,
      "halls": [  // <-- CÓ THỂ CÓ hoặc KHÔNG CÓ
        {
          "id": 1,
          "hallName": "Hall 1",
          "totalSeats": 100
        }
      ]
    }
  ]
}
```

---

## 🧪 Testing Steps

### 1. Kiểm Tra Backend Đang Chạy

```bash
# Test endpoint showtimes
curl http://localhost:8080/api/showtimes/movie/1/date/2025-11-20

# Test endpoint cinemas
curl http://localhost:8080/api/cinemas
```

### 2. Kiểm Tra Console Logs trong Expo

Khi bấm "Mua vé", bạn sẽ thấy các logs:

```
🎬 Fetching showtimes for movie: 1 date: 2025-11-20
📋 Showtimes API response: {...}
First showtime structure: {...}
🏢 All cinemas loaded: 5
Cinema hall IDs to fetch: [1, 2, 3]
Hall to Cinema mapping: {...}
Mapping showtime 1 with cinema: CGV Landmark 81
✅ Showtimes with cinema mapped: 3
```

### 3. Nếu Không Có Log Nào

**Kiểm tra:**
- Backend có đang chạy? (http://localhost:8080)
- URL trong `api.ts` có đúng không?
- Movie có `id` đúng không?
- Ngày có lịch chiếu không?

---

## 🔧 Giải Pháp Cho Từng Vấn Đề

### Vấn Đề 1: "Cannot find showtimes"

**Nguyên nhân có thể:**
1. Backend không có dữ liệu lịch chiếu cho ngày đó
2. Movie ID không tồn tại
3. Backend không chạy

**Giải pháp:**
```sql
-- Kiểm tra database có showtimes không
SELECT * FROM showtimes WHERE movie_id = 1 AND show_date >= CURDATE();

-- Thêm dữ liệu test nếu cần
INSERT INTO showtimes (movie_id, cinema_hall_id, show_date, start_time, end_time, price)
VALUES (1, 1, '2025-11-20', '10:00:00', '12:00:00', 120000);
```

### Vấn Đề 2: "Showtimes loaded but no cinema info"

**Nguyên nhân:**
- Cinema không có `halls` property trong response
- Mapping logic không đúng

**Giải pháp:** Đã cập nhật code để fallback về cinema đầu tiên nếu không map được

### Vấn Đề 3: "Text strings must be rendered within <Text>"

**Nguyên nhân:** 
- Có string được return trực tiếp trong component thay vì wrap trong `<Text>`
- Có thể do error object được render

**Giải pháp:** Đã wrap tất cả text trong `<Text>` component

---

## 📊 Debug Checklist

### Frontend
- [ ] Expo đang chạy không bị lỗi
- [ ] `api.ts` có URL backend đúng
- [ ] Console có show logs không?
- [ ] Movie có tồn tại và có `releaseDate <= today`
- [ ] Network tab có request đến backend không?

### Backend  
- [ ] Spring Boot đang chạy (port 8080)
- [ ] Database có kết nối
- [ ] Table `showtimes` có dữ liệu
- [ ] Table `cinema_halls` có dữ liệu
- [ ] Table `cinemas` có dữ liệu
- [ ] API trả về 200 khi test bằng Postman/curl

### Database
```sql
-- Kiểm tra số lượng dữ liệu
SELECT COUNT(*) FROM movies;
SELECT COUNT(*) FROM cinemas;
SELECT COUNT(*) FROM cinema_halls;
SELECT COUNT(*) FROM showtimes;

-- Kiểm tra showtimes cho movie cụ thể
SELECT s.*, ch.hall_name, c.name as cinema_name
FROM showtimes s
JOIN cinema_halls ch ON s.cinema_hall_id = ch.id
JOIN cinemas c ON ch.cinema_id = c.id
WHERE s.movie_id = 1 AND s.show_date >= CURDATE()
ORDER BY s.show_date, s.start_time;
```

---

## 🚀 Quick Fix Commands

```bash
# 1. Reinstall dependencies
cd fe/BaiTapNhom_LapTrinhChoThietBiDiDong
npm install

# 2. Clear all caches
Remove-Item -Path .expo -Recurse -Force
Remove-Item -Path node_modules/.cache -Recurse -Force

# 3. Restart Expo
npx expo start --clear

# 4. If port 8081 is busy
Get-NetTCPConnection -LocalPort 8081 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

---

## 📞 Debugging API Calls

### Thêm vào `api.ts` để log tất cả requests:

```typescript
// Response interceptor with detailed logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
    if (error.response?.status === 401) {
      await storage.removeItem("authToken");
      await storage.removeItem("user");
    }
    return Promise.reject(error);
  }
);
```

---

## 🎯 Expected Behavior

Sau khi fix, khi bấm "Mua vé" bạn sẽ thấy:

1. **Màn hình loading** (spinner + "Đang tải lịch chiếu...")
2. **7 ngày** hiển thị ở trên (ngày hôm nay được chọn)
3. **Danh sách rạp** (mỗi rạp một card trắng)
4. **Giờ chiếu** (các nút màu hồng với giờ bắt đầu và kết thúc)

**Nếu không có lịch chiếu:**
- Hiển thị: "Chưa có lịch chiếu cho ngày này"

---

## 💡 Tips

1. **Luôn check console logs** - Đó là cách nhanh nhất để biết vấn đề ở đâu
2. **Test backend riêng** với Postman trước khi chạy frontend
3. **Kiểm tra database** - Đảm bảo có dữ liệu test
4. **Clear cache thường xuyên** - Expo cache có thể gây lỗi
5. **Check network tab** trong Expo DevTools để xem API calls

---

## 📝 Next Steps

Nếu vẫn không hoạt động:

1. Chụp screenshot console logs
2. Test API bằng Postman và share response
3. Check database query results
4. Share error messages chi tiết

---

**Last Updated:** November 20, 2025  
**Status:** 🔄 Debugging in Progress
