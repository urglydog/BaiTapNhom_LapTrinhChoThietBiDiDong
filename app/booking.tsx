import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { createBooking } from '../src/store/bookingSlice';
import { Showtime, Seat, Promotion } from '../src/types';
import { promotionService } from '../src/services/promotionService';

export default function BookingScreen() {
  const {
    showtimeId,
    seatIds,
    seatNumbers,
    totalAmount: totalAmountParam,
    movieTitle,
    cinemaName,
    hallName,
    showDate,
    showTime,
  } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const showtime = useSelector((state: RootState) =>
    state.movie.showtimes.find(s => s.id === Number(showtimeId))
  );

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [promotionCode, setPromotionCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  useEffect(() => {
    // Parse seatIds từ params
    if (seatIds) {
      try {
        const parsedSeatIds = JSON.parse(seatIds as string);
        setSelectedSeats(Array.isArray(parsedSeatIds) ? parsedSeatIds : []);
      } catch (e) {
        console.error('Error parsing seatIds:', e);
      }
    }

    // Set total amount từ params hoặc tính toán
    if (totalAmountParam) {
      setTotalAmount(Number(totalAmountParam));
    } else if (showtime && selectedSeats.length > 0) {
      setTotalAmount((showtime.price || 0) * selectedSeats.length);
    }
  }, [seatIds, totalAmountParam, showtime]);

  // Tính toán lại khi totalAmount hoặc promotion thay đổi
  useEffect(() => {
    if (appliedPromotion && totalAmount > 0) {
      let discount = 0;
      if (appliedPromotion.discountType === 'PERCENTAGE') {
        discount = (totalAmount * appliedPromotion.discountValue) / 100;
        if (appliedPromotion.maxDiscount) {
          discount = Math.min(discount, appliedPromotion.maxDiscount);
        }
      } else {
        discount = appliedPromotion.discountValue;
      }

      // Kiểm tra minAmount
      if (appliedPromotion.minAmount && totalAmount < appliedPromotion.minAmount) {
        setDiscountAmount(0);
        setFinalAmount(totalAmount);
      } else {
        setDiscountAmount(discount);
        setFinalAmount(Math.max(0, totalAmount - discount));
      }
    } else {
      setDiscountAmount(0);
      setFinalAmount(totalAmount);
    }
  }, [totalAmount, appliedPromotion]);

  // Validate và apply promotion code
  const handleApplyPromotion = async () => {
    if (!promotionCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã giảm giá');
      return;
    }

    setIsValidatingPromo(true);
    try {
      const promotions = await promotionService.getAvailablePromotions();
      const promotion = promotions.find(p =>
        p.code?.toUpperCase() === promotionCode.trim().toUpperCase()
      );

      if (!promotion) {
        Alert.alert('Lỗi', 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
        setAppliedPromotion(null);
        return;
      }

      // Kiểm tra minAmount
      if (promotion.minAmount && totalAmount < promotion.minAmount) {
        Alert.alert(
          'Lỗi',
          `Đơn hàng tối thiểu ${promotion.minAmount.toLocaleString()} VNĐ để áp dụng mã này`
        );
        setAppliedPromotion(null);
        return;
      }

      setAppliedPromotion(promotion);
      Alert.alert('Thành công', `Đã áp dụng mã giảm giá: ${promotion.name}`);
    } catch (error: any) {
      console.error('Error validating promotion:', error);
      Alert.alert('Lỗi', 'Không thể kiểm tra mã giảm giá. Vui lòng thử lại.');
      setAppliedPromotion(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleBookTicket = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ghế');
      return;
    }

    if (!showtimeId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin suất chiếu');
      return;
    }

    if (!user) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để đặt vé', [
        { text: 'Đăng nhập', onPress: () => router.push('/login' as any) },
        { text: 'Hủy', style: 'cancel' },
      ]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await dispatch(createBooking({
        showtimeId: Number(showtimeId),
        seatIds: selectedSeats,
        promotionCode: appliedPromotion?.code || undefined,
      })).unwrap();

      console.log('Booking result:', result);
      Alert.alert('Thành công', 'Đặt vé thành công!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMessage = error?.message || error?.payload || error || 'Đặt vé thất bại';
      Alert.alert('Lỗi', String(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  if (!showtimeId) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy thông tin suất chiếu</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.card }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: currentTheme.primary }]}>← {t('Quay lại')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, { color: currentTheme.text }]}>{t('Đặt vé')}</Text>
        <Text style={[styles.movieTitle, { color: currentTheme.subtext }]}>{movieTitle || showtime?.movie?.title || t('Phim')}</Text>
        <Text style={[styles.cinemaInfo, { color: currentTheme.subtext }]}>
          {cinemaName || t('Cinema')} • {hallName || t('Phòng chiếu')}
        </Text>
        {showDate && showTime && (
          <Text style={styles.showtime}>
            {new Date(showDate as string).toLocaleDateString('vi-VN')} • {String(showTime).substring(0, 5)}
          </Text>
        )}
        {showtime?.startTime && showtime?.endTime && (
          <Text style={styles.showtime}>
            {showtime.startTime.substring(0, 5)} - {showtime.endTime.substring(0, 5)}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ghế đã chọn</Text>
        {seatNumbers ? (
          <View style={styles.selectedSeatsContainer}>
            <Text style={styles.selectedSeatsText}>{seatNumbers}</Text>
          </View>
        ) : selectedSeats.length > 0 ? (
          <View style={styles.selectedSeatsContainer}>
            <Text style={styles.selectedSeatsText}>
              {selectedSeats.length} ghế đã chọn
            </Text>
          </View>
        ) : (
          <Text style={styles.noSeatsText}>Chưa chọn ghế</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mã giảm giá (tùy chọn)</Text>
        <View style={styles.promotionContainer}>
          <TextInput
            style={styles.promotionInput}
            value={promotionCode}
            onChangeText={setPromotionCode}
            placeholder="Nhập mã giảm giá"
            editable={!isValidatingPromo}
          />
          <TouchableOpacity
            style={[styles.applyButton, isValidatingPromo && styles.disabledButton]}
            onPress={handleApplyPromotion}
            disabled={isValidatingPromo || !promotionCode.trim()}
          >
            {isValidatingPromo ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            )}
          </TouchableOpacity>
        </View>
        {appliedPromotion && (
          <View style={styles.promotionInfo}>
            <Text style={styles.promotionName}>✓ {appliedPromotion.name}</Text>
            <Text style={styles.promotionDesc}>{appliedPromotion.description}</Text>
            <TouchableOpacity
              onPress={() => {
                setAppliedPromotion(null);
                setPromotionCode('');
              }}
            >
              <Text style={styles.removePromoText}>Xóa mã</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Tóm tắt đơn hàng</Text>
        <View style={styles.summaryRow}>
          <Text>Số ghế đã chọn:</Text>
          <Text>{selectedSeats.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Số lượng ghế:</Text>
          <Text>{selectedSeats.length || (seatNumbers ? seatNumbers.split(',').length : 0)} ghế</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Giá mỗi vé:</Text>
          {showtime?.price != null ? (
            <Text>{showtime.price.toLocaleString()} VNĐ</Text>
          ) : totalAmount > 0 && selectedSeats.length > 0 ? (
            <Text>{(totalAmount / selectedSeats.length).toLocaleString()} VNĐ</Text>
          ) : (
            <Text>-- VNĐ</Text>
          )}
        </View>
        {discountAmount > 0 && (
          <>
            <View style={styles.summaryRow}>
              <Text>Giảm giá:</Text>
              <Text style={styles.discountAmount}>
                -{discountAmount.toLocaleString()} VNĐ
              </Text>
            </View>
          </>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.finalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalAmount}>
            {finalAmount.toLocaleString()} VNĐ
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.bookButton, (selectedSeats.length === 0 && !seatIds) && styles.disabledButton]}
        onPress={handleBookTicket}
        disabled={(selectedSeats.length === 0 && !seatIds) || isLoading}
      >
        {isLoading ? (
          <Text style={styles.bookButtonText}>Đang xử lý...</Text>
        ) : (
          <Text style={styles.bookButtonText}>
            Đặt vé ({finalAmount.toLocaleString()} VNĐ)
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 1,
  },
  headerRow: {
    marginBottom: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  movieTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  cinemaInfo: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  showtime: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 4,
  },
  selectedSeatsContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  selectedSeatsText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  noSeatsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  seatMap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  seat: {
    width: 40,
    height: 40,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSeat: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  vipSeat: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  seatText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendSeat: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 4,
  },
  normalSeat: {
    backgroundColor: '#f0f0f0',
  },
  summary: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  promotionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  promotionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  promotionInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  promotionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 4,
  },
  promotionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  removePromoText: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: '600',
  },
  discountAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d32f2f',
  },
  finalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
