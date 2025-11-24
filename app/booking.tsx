import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { createBooking } from '../src/store/bookingSlice';
import { Showtime, Seat, Promotion } from '../src/types';
import { promotionService } from '../src/services/promotionService';
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';
import { Ionicons } from '@expo/vector-icons';

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
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [availablePromotions, setAvailablePromotions] = useState<Promotion[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'VNPAY' | 'CREDIT_CARD'>('VNPAY');

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

  // Load available promotions
  useEffect(() => {
    const loadPromotions = async () => {
      setIsLoadingPromotions(true);
      try {
        const promotions = await promotionService.getAvailablePromotions();
        // Filter promotions that can be applied (check minAmount)
        const applicablePromotions = promotions.filter(promo => {
          if (promo.minAmount && totalAmount > 0) {
            return totalAmount >= promo.minAmount;
          }
          return true;
        });
        
        // Sort by discount value (descending)
        applicablePromotions.sort((a, b) => {
          const discountA = a.discountType === 'PERCENTAGE' 
            ? (totalAmount * a.discountValue / 100) 
            : a.discountValue;
          const discountB = b.discountType === 'PERCENTAGE' 
            ? (totalAmount * b.discountValue / 100) 
            : b.discountValue;
          
          // Apply max discount if exists
          const finalDiscountA = a.maxDiscount ? Math.min(discountA, a.maxDiscount) : discountA;
          const finalDiscountB = b.maxDiscount ? Math.min(discountB, b.maxDiscount) : discountB;
          
          return finalDiscountB - finalDiscountA;
        });
        
        setAvailablePromotions(applicablePromotions);
      } catch (error) {
        console.error('Error loading promotions:', error);
        setAvailablePromotions([]);
      } finally {
        setIsLoadingPromotions(false);
      }
    };

    if (totalAmount > 0) {
      loadPromotions();
    }
  }, [totalAmount]);

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

  // Apply promotion
  const handleSelectPromotion = (promotion: Promotion) => {
    // Kiểm tra minAmount
    if (promotion.minAmount && totalAmount < promotion.minAmount) {
      Alert.alert(
        t('Lỗi'),
        t('Đơn hàng tối thiểu {minAmount} VNĐ để áp dụng mã này', { minAmount: promotion.minAmount.toLocaleString() })
      );
      return;
    }

    setAppliedPromotion(promotion);
  };

  // Calculate discount for a promotion
  const calculatePromotionDiscount = (promotion: Promotion): number => {
    if (!totalAmount || totalAmount < (promotion.minAmount || 0)) {
      return 0;
    }

    let discount = 0;
    if (promotion.discountType === 'PERCENTAGE') {
      discount = (totalAmount * promotion.discountValue) / 100;
      if (promotion.maxDiscount) {
        discount = Math.min(discount, promotion.maxDiscount);
      }
    } else {
      discount = promotion.discountValue;
    }

    return Math.min(discount, totalAmount);
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

    if (!selectedPaymentMethod) {
      Alert.alert(t('Lỗi'), t('Vui lòng chọn phương thức thanh toán'));
      return;
    }

    // Xác nhận trước khi thanh toán
    Alert.alert(
      t('Xác nhận thanh toán'),
      t('Bạn có chắc chắn muốn thanh toán {amount} VNĐ bằng phương thức {method}?', {
        amount: finalAmount.toLocaleString(),
        method: selectedPaymentMethod === 'CASH' ? t('Tiền mặt') :
                selectedPaymentMethod === 'BANK_TRANSFER' ? t('Chuyển khoản') :
                selectedPaymentMethod === 'VNPAY' ? 'VNPay' :
                selectedPaymentMethod === 'CREDIT_CARD' ? t('Thẻ tín dụng') : selectedPaymentMethod
      }),
      [
        {
          text: t('Hủy'),
          style: 'cancel',
        },
        {
          text: t('Xác nhận'),
          onPress: async () => {
            setIsLoading(true);
            try {
              const result = await dispatch(createBooking({
                showtimeId: Number(showtimeId),
                seatIds: selectedSeats,
                promotionCode: appliedPromotion?.code || undefined,
                paymentMethod: selectedPaymentMethod,
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
          },
        },
      ]
    );
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
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.card }]}>
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
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{t('Phương thức thanh toán')}</Text>
        <View style={styles.paymentMethodsContainer}>
          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              { 
                backgroundColor: selectedPaymentMethod === 'VNPAY' ? currentTheme.primary + '20' : currentTheme.background,
                borderColor: selectedPaymentMethod === 'VNPAY' ? currentTheme.primary : currentTheme.subtext + '40',
              }
            ]}
            onPress={() => setSelectedPaymentMethod('VNPAY')}
          >
            <Ionicons 
              name="card" 
              size={24} 
              color={selectedPaymentMethod === 'VNPAY' ? currentTheme.primary : currentTheme.subtext} 
            />
            <Text style={[
              styles.paymentMethodText, 
              { color: selectedPaymentMethod === 'VNPAY' ? currentTheme.primary : currentTheme.text }
            ]}>
              VNPay
            </Text>
            {selectedPaymentMethod === 'VNPAY' && (
              <Ionicons name="checkmark-circle" size={20} color={currentTheme.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              { 
                backgroundColor: selectedPaymentMethod === 'CASH' ? currentTheme.primary + '20' : currentTheme.background,
                borderColor: selectedPaymentMethod === 'CASH' ? currentTheme.primary : currentTheme.subtext + '40',
              }
            ]}
            onPress={() => setSelectedPaymentMethod('CASH')}
          >
            <Ionicons 
              name="cash" 
              size={24} 
              color={selectedPaymentMethod === 'CASH' ? currentTheme.primary : currentTheme.subtext} 
            />
            <Text style={[
              styles.paymentMethodText, 
              { color: selectedPaymentMethod === 'CASH' ? currentTheme.primary : currentTheme.text }
            ]}>
              {t('Tiền mặt')}
            </Text>
            {selectedPaymentMethod === 'CASH' && (
              <Ionicons name="checkmark-circle" size={20} color={currentTheme.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodCard,
              { 
                backgroundColor: selectedPaymentMethod === 'BANK_TRANSFER' ? currentTheme.primary + '20' : currentTheme.background,
                borderColor: selectedPaymentMethod === 'BANK_TRANSFER' ? currentTheme.primary : currentTheme.subtext + '40',
              }
            ]}
            onPress={() => setSelectedPaymentMethod('BANK_TRANSFER')}
          >
            <Ionicons 
              name="business" 
              size={24} 
              color={selectedPaymentMethod === 'BANK_TRANSFER' ? currentTheme.primary : currentTheme.subtext} 
            />
            <Text style={[
              styles.paymentMethodText, 
              { color: selectedPaymentMethod === 'BANK_TRANSFER' ? currentTheme.primary : currentTheme.text }
            ]}>
              {t('Chuyển khoản')}
            </Text>
            {selectedPaymentMethod === 'BANK_TRANSFER' && (
              <Ionicons name="checkmark-circle" size={20} color={currentTheme.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{t('Khuyến mãi có thể áp dụng')}</Text>
        {isLoadingPromotions ? (
          <ActivityIndicator size="small" color={currentTheme.primary} style={{ marginVertical: 20 }} />
        ) : availablePromotions.length === 0 ? (
          <Text style={[styles.noPromotionsText, { color: currentTheme.subtext }]}>
            {t('Không có khuyến mãi nào khả dụng')}
          </Text>
        ) : (
          <FlatList
            data={availablePromotions}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const discount = calculatePromotionDiscount(item);
              const isSelected = appliedPromotion?.id === item.id;
              
              return (
                <TouchableOpacity
                  style={[
                    styles.promotionCard,
                    { 
                      backgroundColor: isSelected ? currentTheme.primary + '20' : currentTheme.background,
                      borderColor: isSelected ? currentTheme.primary : currentTheme.subtext + '40',
                    }
                  ]}
                  onPress={() => handleSelectPromotion(item)}
                >
                  <View style={styles.promotionCardContent}>
                    <View style={styles.promotionCardHeader}>
                      <Text style={[
                        styles.promotionCardName, 
                        { color: isSelected ? currentTheme.primary : currentTheme.text }
                      ]}>
                        {item.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={currentTheme.primary} />
                      )}
                    </View>
                    <Text style={[styles.promotionCardDesc, { color: currentTheme.subtext }]}>
                      {item.description}
                    </Text>
                    <View style={styles.promotionCardFooter}>
                      <Text style={[styles.promotionDiscount, { color: currentTheme.primary }]}>
                        {item.discountType === 'PERCENTAGE' 
                          ? `-${item.discountValue}%` 
                          : `-${item.discountValue.toLocaleString()} VNĐ`}
                      </Text>
                      {discount > 0 && (
                        <Text style={[styles.promotionDiscountAmount, { color: currentTheme.primary }]}>
                          Tiết kiệm: {discount.toLocaleString()} VNĐ
                        </Text>
                      )}
                    </View>
                    {item.minAmount && (
                      <Text style={[styles.promotionMinAmount, { color: currentTheme.subtext }]}>
                        Áp dụng cho đơn từ {item.minAmount.toLocaleString()} VNĐ
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
        {appliedPromotion && (
          <TouchableOpacity
            style={styles.removePromoButton}
            onPress={() => setAppliedPromotion(null)}
          >
            <Text style={styles.removePromoText}>{t('Bỏ chọn khuyến mãi')}</Text>
          </TouchableOpacity>
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
          <Text style={{ color: currentTheme.text }}>{selectedSeats.length || (seatNumbers ? (Array.isArray(seatNumbers) ? seatNumbers.length : seatNumbers.split(',').length) : 0)} {t('ghế')}</Text>
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
  paymentMethodsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  paymentMethodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  promotionCard: {
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  promotionCardContent: {
    gap: 8,
  },
  promotionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promotionCardName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  promotionCardDesc: {
    fontSize: 14,
  },
  promotionCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promotionDiscount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  promotionDiscountAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  promotionMinAmount: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  noPromotionsText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  removePromoButton: {
    marginTop: 12,
    padding: 8,
    alignItems: 'center',
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
