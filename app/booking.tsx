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
  const { showtimeId } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const showtime = useSelector((state: RootState) =>
    state.movie.showtimes.find(s => s.id === Number(showtimeId))
  );

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [promotionCode, setPromotionCode] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (showtime) {
      setTotalAmount(showtime.price * selectedSeats.length);
    }
  }, [selectedSeats, showtime]);

  const handleSeatSelect = (seatId: number) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleBookTicket = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ghế');
      return;
    }

    if (!showtime) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin suất chiếu');
      return;
    }

    try {
      await dispatch(createBooking({
        showtimeId: showtime.id,
        seatIds: selectedSeats,
        promotionCode: promotionCode || undefined,
      })).unwrap();

      Alert.alert('Thành công', 'Đặt vé thành công!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', error as string);
    }
  };

  if (!showtime) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy thông tin suất chiếu</Text>
      </View>
    );
  }

  // Mock seats data - trong thực tế sẽ fetch từ API
  const seats: Seat[] = [
    { id: 1, cinemaHallId: showtime.cinemaHallId, seatNumber: 'A1', seatRow: 'A', seatType: 'NORMAL' },
    { id: 2, cinemaHallId: showtime.cinemaHallId, seatNumber: 'A2', seatRow: 'A', seatType: 'NORMAL' },
    { id: 3, cinemaHallId: showtime.cinemaHallId, seatNumber: 'A3', seatRow: 'A', seatType: 'NORMAL' },
    { id: 4, cinemaHallId: showtime.cinemaHallId, seatNumber: 'B1', seatRow: 'B', seatType: 'VIP' },
    { id: 5, cinemaHallId: showtime.cinemaHallId, seatNumber: 'B2', seatRow: 'B', seatType: 'VIP' },
    { id: 6, cinemaHallId: showtime.cinemaHallId, seatNumber: 'B3', seatRow: 'B', seatType: 'VIP' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đặt vé</Text>
        {showtime.movie?.title && (
          <Text style={styles.movieTitle}>{showtime.movie.title}</Text>
        )}
        {showtime.startTime && showtime.endTime && (
          <Text style={styles.showtime}>
            {showtime.startTime} - {showtime.endTime}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chọn ghế</Text>
        <View style={styles.seatMap}>
          {seats.map((seat) => (
            <TouchableOpacity
              key={seat.id}
              style={[
                styles.seat,
                selectedSeats.includes(seat.id) && styles.selectedSeat,
                seat.seatType === 'VIP' && styles.vipSeat,
              ]}
              onPress={() => handleSeatSelect(seat.id)}
            >
              <Text style={styles.seatText}>{seat.seatNumber}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, styles.normalSeat]} />
            <Text>Ghế thường</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, styles.vipSeat]} />
            <Text>Ghế VIP</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, styles.selectedSeat]} />
            <Text>Đã chọn</Text>
          </View>
        </View>
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
          <Text>Giá mỗi vé:</Text>
          {showtime.price != null && (
            <Text>{showtime.price.toLocaleString()} VNĐ</Text>
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
        style={[styles.bookButton, selectedSeats.length === 0 && styles.disabledButton]}
        onPress={handleBookTicket}
        disabled={selectedSeats.length === 0}
      >
        <Text style={styles.bookButtonText}>
          Đặt vé ({totalAmount.toLocaleString()} VNĐ)
        </Text>
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
  },
  showtime: {
    fontSize: 16,
    color: '#007AFF',
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
