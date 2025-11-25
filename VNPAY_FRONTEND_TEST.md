# Hướng dẫn Test VNPay từ Frontend

## ✅ Kiểm tra trước khi test

### 1. API URL đã đúng chưa?

Kiểm tra file `src/services/api.ts`:
- Đảm bảo `API_BASE_URL` trỏ đến server Render của bạn
- Ví dụ: `https://your-app.onrender.com/api`

### 2. Server đã sẵn sàng?

Test endpoint từ browser hoặc Postman:
```bash
GET https://your-app.onrender.com/api/vnpay/test?amount=100000
```

Nếu trả về `paymentUrl` → Server OK ✅

## 🧪 Các bước test từ Frontend

### Bước 1: Test Flow Đặt Vé với VNPay

1. **Mở app và đăng nhập**

2. **Chọn phim và đặt vé:**
   - Chọn phim
   - Chọn suất chiếu
   - Chọn ghế
   - Đến màn hình Booking

3. **Chọn phương thức thanh toán VNPay:**
   - Trong màn hình Booking
   - Chọn "VNPay" (nút có icon card)
   - Xác nhận phương thức đã được chọn

4. **Nhấn nút "Xác nhận thanh toán"**

5. **Kiểm tra flow:**
   - App sẽ tạo booking trước
   - Sau đó gọi API `/api/vnpay/create-payment`
   - Nhận payment URL
   - Mở browser với payment URL

### Bước 2: Test Thanh toán trên VNPay

1. **Browser sẽ mở trang VNPay:**
   - Kiểm tra URL là VNPay sandbox
   - Kiểm tra số tiền đúng chưa

2. **Nếu gặp lỗi "Website chưa được phê duyệt":**
   - Cần đăng ký URL Render trong VNPay Sandbox
   - Xem hướng dẫn trong `DEPLOY_CHECKLIST.md`

3. **Test thanh toán:**
   - Chọn phương thức thanh toán
   - Nhập thông tin thẻ test:
     - Số thẻ: `9704198526191432198`
     - Tên: `NGUYEN VAN A`
     - Ngày: `07/15`
     - OTP: `123456`

4. **Sau khi thanh toán:**
   - VNPay sẽ redirect về `/api/vnpay/return`
   - Backend sẽ cập nhật payment status
   - Hiển thị trang "Thanh toán thành công"

### Bước 3: Kiểm tra kết quả

1. **Quay lại app:**
   - Vào màn hình "Lịch sử đặt vé"
   - Kiểm tra booking có status "Đã thanh toán" không
   - Kiểm tra payment method là "VNPay"

2. **Kiểm tra database (nếu có quyền):**
   - Booking có `payment_status = 'PAID'`
   - Booking có `payment_method = 'VNPAY'`

## 🔍 Debug và Troubleshooting

### Lỗi: "Failed to create payment URL"

**Nguyên nhân:**
- API URL không đúng
- Server chưa sẵn sàng
- Booking không tồn tại
- Payment method không phải VNPAY

**Cách fix:**
1. Kiểm tra console log trong app
2. Kiểm tra network request trong DevTools
3. Kiểm tra response từ API
4. Verify booking đã được tạo với paymentMethod = "VNPAY"

### Lỗi: "Cannot open payment URL"

**Nguyên nhân:**
- URL không hợp lệ
- Browser không thể mở URL

**Cách fix:**
1. Kiểm tra `paymentUrl` có đúng format không
2. Thử copy URL và mở thủ công trong browser
3. Kiểm tra `Linking.canOpenURL()` trả về true

### Lỗi: "Website chưa được phê duyệt"

**Nguyên nhân:**
- URL Render chưa đăng ký trong VNPay Sandbox

**Cách fix:**
1. Đăng nhập VNPay Sandbox
2. Đăng ký URL Render
3. Chờ vài phút để hệ thống cập nhật
4. Test lại

### Payment thành công nhưng status không update

**Nguyên nhân:**
- Return URL không hoạt động
- IPN không được gọi
- Booking code không match

**Cách fix:**
1. Kiểm tra logs trên Render
2. Kiểm tra return URL có được gọi không
3. Verify booking code trong database
4. Kiểm tra IPN endpoint có nhận được request không

## 📱 Test trên Mobile Device

### Android:
1. Build và cài đặt app
2. Cho phép app mở browser
3. Test flow như trên

### iOS:
1. Build và cài đặt app
2. Cấu hình URL scheme nếu cần
3. Test flow như trên

## 🧪 Test Cases

### Test Case 1: Đặt vé với VNPay thành công
- [ ] Chọn VNPay
- [ ] Tạo booking thành công
- [ ] Payment URL được tạo
- [ ] Browser mở VNPay
- [ ] Thanh toán thành công
- [ ] Status được update

### Test Case 2: Đặt vé với VNPay nhưng hủy thanh toán
- [ ] Chọn VNPay
- [ ] Tạo booking thành công
- [ ] Mở VNPay
- [ ] Hủy thanh toán
- [ ] Status vẫn là PENDING

### Test Case 3: Đặt vé với CASH (không dùng VNPay)
- [ ] Chọn CASH
- [ ] Tạo booking thành công
- [ ] Không mở browser
- [ ] Hiển thị thông báo thành công

### Test Case 4: Lỗi khi tạo payment URL
- [ ] Chọn VNPay
- [ ] Tạo booking thành công
- [ ] API trả về lỗi
- [ ] Hiển thị thông báo lỗi
- [ ] User có thể quay lại

## 📊 Kiểm tra Logs

### Frontend Logs:
- Console log trong React Native
- Network requests trong DevTools
- Error messages

### Backend Logs (trên Render):
- Application logs
- API request logs
- Error logs
- Payment processing logs

## ✅ Checklist Test

- [ ] API URL đúng
- [ ] Server đang chạy
- [ ] Có thể tạo booking
- [ ] Payment URL được tạo
- [ ] Browser mở được
- [ ] VNPay hiển thị đúng
- [ ] Thanh toán thành công
- [ ] Status được update
- [ ] App hiển thị đúng thông tin

