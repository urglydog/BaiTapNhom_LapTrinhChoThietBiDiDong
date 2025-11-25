import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { Booking } from '../src/types';
import { bookingService } from '../src/services/bookingService';
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';
import { pdfService } from '../src/services/pdfService';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import QRCode from 'react-native-qrcode-svg';

export default function TicketDetailScreen() {
  const { bookingId, qrCode } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useSelector((state: RootState) => state.theme);
  const t = useTranslation();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Generate QR code data as JSON - must be before early returns to maintain hook order
  const qrData = React.useMemo(() => {
    if (!booking) {
      return '';
    }
    // Use JSON format for better compatibility when scanning
    return JSON.stringify({
      bookingId: booking.id,
      bookingCode: booking.bookingCode || `#${booking.id}`,
    });
  }, [booking?.id, booking?.bookingCode]);

  useEffect(() => {
    loadBooking();
  }, [bookingId, qrCode]);

  const loadBooking = async () => {
    setIsLoading(true);
    try {
      let bookingData: Booking | null = null;
      
      if (qrCode) {
        // If QR code is provided, try to parse it
        try {
          const qrData = JSON.parse(qrCode);
          if (qrData.bookingCode) {
            bookingData = await bookingService.getBookingByCode(qrData.bookingCode);
          } else if (qrData.bookingId) {
            bookingData = await bookingService.getBookingById(Number(qrData.bookingId));
          }
        } catch (parseError) {
          // If QR code is not JSON, try as booking code directly
          if (bookingId) {
            bookingData = await bookingService.getBookingById(Number(bookingId));
          }
        }
      } else if (bookingId) {
        bookingData = await bookingService.getBookingById(Number(bookingId));
      } else {
        throw new Error('Booking ID or QR code required');
      }

      if (!bookingData) {
        throw new Error('Không tìm thấy thông tin vé');
      }

      setBooking(bookingData);
    } catch (error: any) {
      console.error('Error loading booking:', error);
      const errorMessage = error?.message || error?.response?.data?.message || t('Không thể tải thông tin vé');
      Alert.alert(
        t('Lỗi'), 
        errorMessage,
        [
          { 
            text: t('Thử lại'), 
            onPress: () => loadBooking() 
          },
          { 
            text: t('Quay lại'), 
            style: 'cancel',
            onPress: () => router.back()
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!booking) return;

    setIsGeneratingPDF(true);
    try {
      const pdfUri = await pdfService.generateTicketPDF(booking);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: t('Xuất vé PDF'),
        });
      } else {
        Alert.alert(
          t('Thành công'),
          t('PDF đã được tạo tại: {uri}', { uri: pdfUri })
        );
      }
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      Alert.alert(t('Lỗi'), t('Không thể xuất PDF'));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string | undefined | null) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'CASH':
        return t('Tiền mặt');
      case 'BANK_TRANSFER':
        return t('Chuyển khoản');
      case 'VNPAY':
        return 'VNPay';
      case 'CREDIT_CARD':
        return t('Thẻ tín dụng');
      default:
        return t('Chưa xác định');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return t('Đã xác nhận');
      case 'PENDING':
        return t('Đang chờ');
      case 'CANCELLED':
        return t('Đã hủy');
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: currentTheme.background }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={[styles.loadingText, { color: currentTheme.subtext }]}>
          {t('Đang tải thông tin vé...')}
        </Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: currentTheme.background }]}>
        <Text style={[styles.errorText, { color: currentTheme.text }]}>
          {t('Không tìm thấy thông tin vé')}
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: currentTheme.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>{t('Quay lại')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const movie = booking.showtime?.movie;
  const showtime = booking.showtime;
  const cinema = showtime?.cinemaHall?.cinema;
  const hall = showtime?.cinemaHall;
  const user = booking.user;

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
          <Text style={[styles.backButtonText, { color: currentTheme.primary }]}>← {t('Quay lại')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          {t('Chi tiết vé')}
        </Text>
      </View>

      <View style={[styles.content, { backgroundColor: currentTheme.card }]}>
        {/* QR Code Section */}
        <View style={[styles.qrSection, { backgroundColor: currentTheme.background }]}>
          <Text style={[styles.qrTitle, { color: currentTheme.text }]}>
            {t('Mã QR vé')}
          </Text>
          <View style={styles.qrContainer}>
            {qrData ? (
              <QRCode
                value={qrData}
                size={200}
                color={currentTheme.text}
                backgroundColor={currentTheme.background}
              />
            ) : (
              <ActivityIndicator size="large" color={currentTheme.primary} />
            )}
          </View>
          {booking.qrCode && (
            <Text style={[styles.qrCodeText, { color: currentTheme.subtext }]}>
              {booking.qrCode}
            </Text>
          )}
        </View>

        {/* Booking Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            {t('Thông tin đặt vé')}
          </Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
              {t('Mã đặt vé')}:
            </Text>
            <Text style={[styles.infoValue, { color: currentTheme.text }]}>
              {booking.bookingCode || `#${booking.id}`}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
              {t('Trạng thái')}:
            </Text>
            <Text style={[styles.infoValue, { color: currentTheme.primary }]}>
              {getStatusText(booking.status)}
            </Text>
          </View>

          {booking.bookingDate && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                {t('Ngày đặt')}:
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                {formatDate(booking.bookingDate)}
              </Text>
            </View>
          )}
        </View>

        {/* Movie Info */}
        {movie && (
          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {t('Thông tin phim')}
            </Text>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                {t('Phim')}:
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                {movie.title}
              </Text>
            </View>

            {movie.duration && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                  {t('Thời lượng')}:
                </Text>
                <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                  {movie.duration} {t('phút')}
                </Text>
              </View>
            )}

            {showtime?.showDate && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                  {t('Ngày chiếu')}:
                </Text>
                <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                  {formatDate(showtime.showDate)}
                </Text>
              </View>
            )}

            {showtime?.startTime && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                  {t('Giờ chiếu')}:
                </Text>
                <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                  {`${formatTime(showtime.startTime)}${showtime.endTime ? ` - ${formatTime(showtime.endTime)}` : ''}`}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Cinema Info */}
        {cinema && (
          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {t('Thông tin rạp')}
            </Text>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                {t('Rạp')}:
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                {cinema.name}
              </Text>
            </View>

            {hall?.name && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                  {t('Phòng chiếu')}:
                </Text>
                <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                  {hall.name}
                </Text>
              </View>
            )}

            {cinema.address && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                  {t('Địa chỉ')}:
                </Text>
                <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                  {cinema.address}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Seats Info */}
        {(() => {
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
              return (
                <View style={styles.infoSection}>
                  <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
                    {t('Ghế đã đặt')}
                  </Text>
                  <Text style={[styles.seatsText, { color: currentTheme.text }]}>
                    {seatNumbers.join(', ')}
                  </Text>
                </View>
              );
            }
          }
          return null;
        })()}

        {/* User Info */}
        {user && (
          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              {t('Thông tin khách hàng')}
            </Text>
            
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                {t('Tên')}:
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                {user.fullName || user.username || 'N/A'}
              </Text>
            </View>

            {user.email && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                  {t('Email')}:
                </Text>
                <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                  {user.email}
                </Text>
              </View>
            )}

            {user.phone && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                  {t('Số điện thoại')}:
                </Text>
                <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                  {user.phone}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Payment Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            {t('Thông tin thanh toán')}
          </Text>
          
          {booking.paymentMethod && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                {t('Phương thức thanh toán')}:
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                {getPaymentMethodText(booking.paymentMethod)}
              </Text>
            </View>
          )}

          {booking.promotion && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                {t('Khuyến mãi')}:
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                {booking.promotion.name}
              </Text>
            </View>
          )}

          {booking.discountAmount && booking.discountAmount > 0 && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
                {t('Giảm giá')}:
              </Text>
              <Text style={[styles.infoValue, { color: '#d32f2f' }]}>
                -{booking.discountAmount.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>
              {t('Tổng tiền')}:
            </Text>
            <Text style={[styles.infoValue, styles.totalAmount, { color: currentTheme.primary }]}>
              {booking.totalAmount.toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>
        </View>

        {/* Export PDF Button */}
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: currentTheme.primary }]}
          onPress={handleExportPDF}
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.exportButtonText}>
              {t('Xuất vé PDF')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  backButtonHeader: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  qrSection: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
  },
  qrCodeText: {
    fontSize: 12,
    marginTop: 8,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seatsText: {
    fontSize: 16,
    fontWeight: '500',
  },
  exportButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});

