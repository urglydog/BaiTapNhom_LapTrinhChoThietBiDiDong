import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { createBooking } from '../src/store/bookingSlice';
import { Showtime, Seat } from '../src/types';

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
  const [totalAmount, setTotalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
      await dispatch(createBooking({
        showtimeId: Number(showtimeId),
        seatIds: selectedSeats,
        promotionCode: promotionCode || undefined,
      })).unwrap();

      Alert.alert('Thành công', 'Đặt vé thành công!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || error || 'Đặt vé thất bại');
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đặt vé</Text>
        <Text style={styles.movieTitle}>{movieTitle || showtime?.movie?.title || 'Phim'}</Text>
        <Text style={styles.cinemaInfo}>
          {cinemaName || 'Rạp chiếu'} • {hallName || 'Phòng chiếu'}
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
        <TextInput
          style={styles.promotionInput}
          value={promotionCode}
          onChangeText={setPromotionCode}
          placeholder="Nhập mã giảm giá"
        />
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
        <View style={styles.summaryRow}>
          <Text>Tổng cộng:</Text>
          <Text style={styles.totalAmount}>
            {totalAmount.toLocaleString()} VNĐ
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
            Đặt vé ({totalAmount.toLocaleString()} VNĐ)
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
  promotionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
