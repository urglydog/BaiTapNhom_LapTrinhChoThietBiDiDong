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
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';

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
  const { theme } = useSelector((state: RootState) => state.theme);
  const t = useTranslation();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

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
      Alert.alert(t('Lỗi'), t('Vui lòng nhập mã giảm giá'));
      return;
    }

    setIsValidatingPromo(true);
    try {
      const promotions = await promotionService.getAvailablePromotions();
      const promotion = promotions.find(p =>
        p.code?.toUpperCase() === promotionCode.trim().toUpperCase()
      );

      if (!promotion) {
        Alert.alert(t('Lỗi'), t('Mã giảm giá không hợp lệ hoặc đã hết hạn'));
        setAppliedPromotion(null);
        return;
      }

      // Kiểm tra minAmount
      if (promotion.minAmount && totalAmount < promotion.minAmount) {
        Alert.alert(
          t('Lỗi'),
          t('Đơn hàng tối thiểu {minAmount} VNĐ để áp dụng mã này', { minAmount: promotion.minAmount.toLocaleString() })
        );
        setAppliedPromotion(null);
        return;
      }

      setAppliedPromotion(promotion);
      Alert.alert(t('Thành công'), t('Đã áp dụng mã giảm giá: {name}', { name: promotion.name }));
    } catch (error: any) {
      console.error('Error validating promotion:', error);
      Alert.alert(t('Lỗi'), t('Không thể kiểm tra mã giảm giá. Vui lòng thử lại.'));
      setAppliedPromotion(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleBookTicket = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert(t('Lỗi'), t('Vui lòng chọn ghế'));
      return;
    }

    if (!showtimeId) {
      Alert.alert(t('Lỗi'), t('Không tìm thấy thông tin suất chiếu'));
      return;
    }

    if (!user) {
      Alert.alert(t('Thông báo'), t('Vui lòng đăng nhập để đặt vé'), [
        { text: t('Đăng nhập'), onPress: () => router.push('/login' as any) },
        { text: t('Hủy'), style: 'cancel' },
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
      Alert.alert(t('Thành công'), t('Đặt vé thành công!'), [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMessage = error?.message || error?.payload || error || t('Đặt vé thất bại');
      Alert.alert(t('Lỗi'), String(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  if (!showtimeId) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <Text style={{ color: currentTheme.text }}>{t('Không tìm thấy thông tin suất chiếu')}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: currentTheme.primary }}>{t('Quay lại')}</Text>
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
          <Text style={[styles.showtime, { color: currentTheme.primary }]}>
            {new Date(showDate as string).toLocaleDateString(t('vi-VN'))} • {String(showTime).substring(0, 5)}
          </Text>
        )}
        {showtime?.startTime && showtime?.endTime && (
          <Text style={[styles.showtime, { color: currentTheme.primary }]}>
            {showtime.startTime.substring(0, 5)} - {showtime.endTime.substring(0, 5)}
          </Text>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{t('Ghế đã chọn')}</Text>
        {seatNumbers ? (
          <View style={[styles.selectedSeatsContainer, { backgroundColor: currentTheme.background }]}>
            <Text style={[styles.selectedSeatsText, { color: currentTheme.text }]}>{seatNumbers}</Text>
          </View>
        ) : selectedSeats.length > 0 ? (
          <View style={[styles.selectedSeatsContainer, { backgroundColor: currentTheme.background }]}>
            <Text style={[styles.selectedSeatsText, { color: currentTheme.text }]}>
              {selectedSeats.length} {t('ghế đã chọn')}
            </Text>
          </View>
        ) : (
          <Text style={[styles.noSeatsText, { color: currentTheme.subtext }]}>{t('Chưa chọn ghế')}</Text>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{t('Mã giảm giá (tùy chọn)')}</Text>
        <View style={styles.promotionContainer}>
          <TextInput
            style={[styles.promotionInput, { backgroundColor: currentTheme.background, color: currentTheme.text, borderColor: currentTheme.subtext }]}
            value={promotionCode}
            onChangeText={setPromotionCode}
            placeholder={t('Nhập mã giảm giá')}
            editable={!isValidatingPromo}
          />
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: currentTheme.primary }, isValidatingPromo && styles.disabledButton]}
            onPress={handleApplyPromotion}
            disabled={isValidatingPromo || !promotionCode.trim()}
          >
            {isValidatingPromo ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.applyButtonText}>{t('Áp dụng')}</Text>
            )}
          </TouchableOpacity>
        </View>
        {appliedPromotion && (
          <View style={[styles.promotionInfo, { backgroundColor: currentTheme.background }]}>
            <Text style={[styles.promotionName, { color: currentTheme.primary }]}>✓ {appliedPromotion.name}</Text>
            <Text style={[styles.promotionDesc, { color: currentTheme.subtext }]}>{appliedPromotion.description}</Text>
            <TouchableOpacity
              onPress={() => {
                setAppliedPromotion(null);
                setPromotionCode('');
              }}
            >
              <Text style={styles.removePromoText}>{t('Xóa mã')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.summary, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.summaryTitle, { color: currentTheme.text }]}>{t('Tóm tắt đơn hàng')}</Text>
        <View style={styles.summaryRow}>
          <Text style={{ color: currentTheme.text }}>{t('Số ghế đã chọn:')}</Text>
          <Text style={{ color: currentTheme.text }}>{selectedSeats.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{ color: currentTheme.text }}>{t('Số lượng ghế:')}</Text>
          <Text style={{ color: currentTheme.text }}>{selectedSeats.length || (seatNumbers ? seatNumbers.split(',').length : 0)} {t('ghế')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{ color: currentTheme.text }}>{t('Giá mỗi vé:')}</Text>
          {showtime?.price != null ? (
            <Text style={{ color: currentTheme.text }}>{showtime.price.toLocaleString()} {t('VNĐ')}</Text>
          ) : totalAmount > 0 && selectedSeats.length > 0 ? (
            <Text style={{ color: currentTheme.text }}>{(totalAmount / selectedSeats.length).toLocaleString()} {t('VNĐ')}</Text>
          ) : (
            <Text style={{ color: currentTheme.text }}>-- {t('VNĐ')}</Text>
          )}
        </View>
        {discountAmount > 0 && (
          <>
            <View style={styles.summaryRow}>
              <Text style={{ color: currentTheme.text }}>{t('Giảm giá:')}</Text>
              <Text style={styles.discountAmount}>
                -{discountAmount.toLocaleString()} {t('VNĐ')}
              </Text>
            </View>
          </>
        )}
        <View style={styles.summaryRow}>
          <Text style={[styles.finalLabel, { color: currentTheme.text }]}>{t('Tổng cộng:')}</Text>
          <Text style={[styles.totalAmount, { color: currentTheme.primary }]}>
            {finalAmount.toLocaleString()} {t('VNĐ')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.bookButton, { backgroundColor: currentTheme.primary }, (selectedSeats.length === 0 && !seatIds) && styles.disabledButton]}
        onPress={handleBookTicket}
        disabled={(selectedSeats.length === 0 && !seatIds) || isLoading}
      >
        {isLoading ? (
          <Text style={styles.bookButtonText}>{t('Đang xử lý...')}</Text>
        ) : (
          <Text style={styles.bookButtonText}>
            {t('Đặt vé')} ({finalAmount.toLocaleString()} {t('VNĐ')})
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
    marginBottom: 8,
  },
  movieTitle: {
    fontSize: 18,
    marginBottom: 4,
    fontWeight: '600',
  },
  cinemaInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  showtime: {
    fontSize: 16,
    marginTop: 4,
  },
  selectedSeatsContainer: {
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  selectedSeatsText: {
    fontSize: 16,
    fontWeight: '500',
  },
  noSeatsText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  section: {
    padding: 20,
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  selectedSeat: {},
  vipSeat: {},
  seatText: {
    fontSize: 12,
    fontWeight: 'bold',
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
  normalSeat: {},
  summary: {
    padding: 20,
    marginBottom: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  },
  promotionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  promotionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  applyButton: {
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
    borderRadius: 8,
  },
  promotionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  promotionDesc: {
    fontSize: 14,
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
