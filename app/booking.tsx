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
import { useAppSelector } from '@/src/hooks/redux';
import { darkTheme, lightTheme } from '@/src/themes';
import { useTranslation } from 'react-i18next';

export default function BookingScreen() {
  const { t } = useTranslation();
  const { showtimeId } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const showtime = useSelector((state: RootState) =>
    state.movie.showtimes.find(s => s.id === Number(showtimeId))
  );
  const { theme } = useAppSelector((state) => state.theme);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(currentTheme);

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
      Alert.alert(t('Error'), t('Please select a seat'));
      return;
    }

    if (!showtime) {
      Alert.alert(t('Error'), t('Showtime information not found'));
      return;
    }

    try {
      await dispatch(createBooking({
        showtimeId: showtime.id,
        seatIds: selectedSeats,
        promotionCode: promotionCode || undefined,
      })).unwrap();

      Alert.alert(t('Success'), t('Booking successful!'), [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert(t('Error'), error as string);
    }
  };

  if (!showtime) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('Showtime information not found')}</Text>
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
        <Text style={styles.title}>{t('Book ticket')}</Text>
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
        <Text style={styles.sectionTitle}>{t('Select seats')}</Text>
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
            <Text style={styles.legendText}>{t('Normal seat')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, styles.vipSeat]} />
            <Text style={styles.legendText}>{t('VIP seat')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSeat, styles.selectedSeat]} />
            <Text style={styles.legendText}>{t('Selected')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('Promotion code (optional)')}</Text>
        <TextInput
          style={styles.promotionInput}
          value={promotionCode}
          onChangeText={setPromotionCode}
          placeholder={t('Enter promotion code')}
          placeholderTextColor={currentTheme.text}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>{t('Order summary')}</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>{t('Number of selected seats')}:</Text>
          <Text style={styles.summaryText}>{selectedSeats.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>{t('Price per ticket')}:</Text>
          {showtime.price != null && (
            <Text style={styles.summaryText}>{showtime.price.toLocaleString()} VNĐ</Text>
          )}
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>{t('Total')}:</Text>
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
          {t('Book ticket')} ({totalAmount.toLocaleString()} VNĐ)
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.card,
    padding: 20,
    marginBottom: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  movieTitle: {
    fontSize: 18,
    color: theme.text,
    marginBottom: 4,
  },
  showtime: {
    fontSize: 16,
    color: theme.primary,
  },
  section: {
    backgroundColor: theme.card,
    padding: 20,
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
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
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  selectedSeat: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  vipSeat: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  seatText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.text,
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
    backgroundColor: theme.background,
  },
  legendText: {
    color: theme.text,
  },
  summary: {
    backgroundColor: theme.card,
    padding: 20,
    marginBottom: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    color: theme.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primary,
  },
  promotionInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text,
  },
  bookButton: {
    backgroundColor: theme.primary,
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
  errorText: {
      color: theme.text
  }
});
