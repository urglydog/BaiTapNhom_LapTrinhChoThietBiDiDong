import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import { Booking } from '../types';

export const pdfService = {
  generateTicketPDF: async (booking: Booking): Promise<string> => {
    const movie = booking.showtime?.movie;
    const showtime = booking.showtime;
    const cinema = showtime?.cinemaHall?.cinema;
    const hall = showtime?.cinemaHall;
    const user = booking.user;

    // Format date
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatTime = (timeString: string) => {
      return timeString.substring(0, 5);
    };

    // Generate QR code URL using QR code API service
    const generateQRCodeUrl = (): string => {
      try {
        // Use JSON format for QR code data
        const qrData = JSON.stringify({
          bookingId: booking.id,
          bookingCode: booking.bookingCode || `#${booking.id}`,
        });

        // Encode the data for URL
        const encodedData = encodeURIComponent(qrData);
        
        // Use a QR code API service to generate the QR code image
        // Using api.qrserver.com which is free and doesn't require API key
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;
      } catch (error) {
        console.error('Error generating QR code URL:', error);
        // Return empty string if QR generation fails
        return '';
      }
    };

    const qrCodeImageUrl = generateQRCodeUrl();

    // Generate HTML for PDF
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
              background: #fff;
            }
            .ticket {
              max-width: 600px;
              margin: 0 auto;
              border: 2px solid #E91E63;
              border-radius: 12px;
              padding: 30px;
              background: linear-gradient(135deg, #fff 0%, #f5f5f5 100%);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px dashed #E91E63;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #E91E63;
              font-size: 28px;
              margin-bottom: 10px;
            }
            .header p {
              color: #666;
              font-size: 14px;
            }
            .qr-section {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background: #fff;
              border-radius: 8px;
              border: 1px solid #e0e0e0;
            }
            .qr-placeholder {
              width: 200px;
              height: 200px;
              margin: 0 auto;
              background: #f0f0f0;
              border: 2px dashed #ccc;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #999;
              font-size: 12px;
            }
            .info-section {
              margin: 20px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              font-weight: 600;
              color: #333;
              font-size: 14px;
            }
            .info-value {
              color: #666;
              font-size: 14px;
              text-align: right;
              flex: 1;
              margin-left: 20px;
            }
            .seats-section {
              margin: 20px 0;
              padding: 15px;
              background: #f9f9f9;
              border-radius: 8px;
            }
            .seats-title {
              font-weight: 600;
              color: #333;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .seats-list {
              color: #666;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px dashed #E91E63;
              color: #999;
              font-size: 12px;
            }
            .booking-code {
              font-size: 18px;
              font-weight: bold;
              color: #E91E63;
              margin: 10px 0;
            }
            .total-amount {
              font-size: 20px;
              font-weight: bold;
              color: #E91E63;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <h1>VÉ XEM PHIM</h1>
              <p>Cinema Ticket</p>
            </div>

            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Mã đặt vé:</span>
                <span class="info-value booking-code">${booking.bookingCode || `#${booking.id}`}</span>
              </div>
              ${booking.qrCode ? `
              <div class="info-row">
                <span class="info-label">Mã QR:</span>
                <span class="info-value">${booking.qrCode}</span>
              </div>
              ` : ''}
            </div>

            <div class="qr-section">
              ${qrCodeImageUrl ? `
              <img src="${qrCodeImageUrl}" alt="QR Code" style="width: 200px; height: 200px; margin: 0 auto; display: block;" />
              ` : `
              <div class="qr-placeholder">
                QR Code sẽ được hiển thị khi in
              </div>
              `}
              <p style="margin-top: 10px; color: #666; font-size: 12px; text-align: center;">
                Quét mã QR để xem chi tiết vé
              </p>
            </div>

            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Phim:</span>
                <span class="info-value">${movie?.title || 'N/A'}</span>
              </div>
              ${movie?.duration ? `
              <div class="info-row">
                <span class="info-label">Thời lượng:</span>
                <span class="info-value">${movie.duration} phút</span>
              </div>
              ` : ''}
              ${showtime?.showDate ? `
              <div class="info-row">
                <span class="info-label">Ngày chiếu:</span>
                <span class="info-value">${formatDate(showtime.showDate)}</span>
              </div>
              ` : ''}
              ${showtime?.startTime ? `
              <div class="info-row">
                <span class="info-label">Giờ chiếu:</span>
                <span class="info-value">${formatTime(showtime.startTime)}${showtime.endTime ? ` - ${formatTime(showtime.endTime)}` : ''}</span>
              </div>
              ` : ''}
              ${cinema?.name ? `
              <div class="info-row">
                <span class="info-label">Rạp:</span>
                <span class="info-value">${cinema.name}</span>
              </div>
              ` : ''}
              ${hall?.name ? `
              <div class="info-row">
                <span class="info-label">Phòng chiếu:</span>
                <span class="info-value">${hall.name}</span>
              </div>
              ` : ''}
              ${cinema?.address ? `
              <div class="info-row">
                <span class="info-label">Địa chỉ:</span>
                <span class="info-value">${cinema.address}</span>
              </div>
              ` : ''}
            </div>

            ${(() => {
              // Hỗ trợ cả seats và bookingItems
              const seats = booking.seats || (booking.bookingItems?.map((bi: any) => ({
                seat: bi.seat,
                seatNumber: bi.seat?.seatNumber,
                seatRow: bi.seat?.seatRow,
              })) || []);
              
              if (seats && seats.length > 0) {
                const seatNumbers = seats.map((s: any) => {
                  if (s.seat?.seatNumber) return s.seat.seatNumber;
                  if (s.seatNumber) return s.seatNumber;
                  if (s.seat?.seatRow && s.seat?.seatNumber) return `${s.seat.seatRow}${s.seat.seatNumber}`;
                  if (s.seatRow && s.seatNumber) return `${s.seatRow}${s.seatNumber}`;
                  return null;
                }).filter(Boolean);
                
                if (seatNumbers.length > 0) {
                  return `
                    <div class="seats-section">
                      <div class="seats-title">Ghế đã đặt:</div>
                      <div class="seats-list">
                        ${seatNumbers.join(', ')}
                      </div>
                    </div>
                  `;
                }
              }
              return '';
            })()}

            <div class="info-section">
              ${user ? `
              <div class="info-row">
                <span class="info-label">Khách hàng:</span>
                <span class="info-value">${user.fullName || user.username || 'N/A'}</span>
              </div>
              ${user.email ? `
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${user.email}</span>
              </div>
              ` : ''}
              ${user.phone ? `
              <div class="info-row">
                <span class="info-label">Số điện thoại:</span>
                <span class="info-value">${user.phone}</span>
              </div>
              ` : ''}
              ` : ''}
              ${booking.bookingDate ? `
              <div class="info-row">
                <span class="info-label">Ngày đặt:</span>
                <span class="info-value">${formatDate(booking.bookingDate)}</span>
              </div>
              ` : ''}
              ${booking.paymentMethod ? `
              <div class="info-row">
                <span class="info-label">Phương thức thanh toán:</span>
                <span class="info-value">${
                  booking.paymentMethod === 'CASH' ? 'Tiền mặt' :
                  booking.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                  booking.paymentMethod === 'VNPAY' ? 'VNPay' :
                  booking.paymentMethod === 'CREDIT_CARD' ? 'Thẻ tín dụng' :
                  booking.paymentMethod
                }</span>
              </div>
              ` : ''}
              ${booking.promotion ? `
              <div class="info-row">
                <span class="info-label">Khuyến mãi:</span>
                <span class="info-value">${booking.promotion.name}</span>
              </div>
              ` : ''}
              ${booking.discountAmount ? `
              <div class="info-row">
                <span class="info-label">Giảm giá:</span>
                <span class="info-value">-${booking.discountAmount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">Tổng tiền:</span>
                <span class="info-value total-amount">${booking.totalAmount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div class="info-row">
                <span class="info-label">Trạng thái:</span>
                <span class="info-value">${
                  booking.status === 'CONFIRMED' ? 'Đã xác nhận' :
                  booking.status === 'PENDING' ? 'Đang chờ' :
                  booking.status === 'CANCELLED' ? 'Đã hủy' :
                  booking.status
                }</span>
              </div>
            </div>

            <div class="footer">
              <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
              <p>Vui lòng đến rạp trước 15 phút để làm thủ tục vào cửa.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      return uri;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  },

  sharePDF: async (uri: string) => {
    // This would typically use expo-sharing, but for now we'll just return the URI
    return uri;
  },
};

