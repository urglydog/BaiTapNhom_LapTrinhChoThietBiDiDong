import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { fetchUserBookings } from '../src/store/bookingSlice';
import { Booking } from '../src/types';
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';

export default function BookingHistoryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, isLoading } = useSelector((state: RootState) => state.booking);
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.theme);
  const t = useTranslation();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    if (user) {
      dispatch(fetchUserBookings());
    }
  }, [dispatch, user]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        dispatch(fetchUserBookings());
      }
    }, [dispatch, user])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchUserBookings());
    setRefreshing(false);
  };

  const handleBookingPress = (booking: Booking) => {
    const movieId = booking.showtime?.movie?.id || booking.showtime?.movieId;
    if (movieId) {
      router.push(`/movie-detail?movieId=${movieId}`);
    } else {
      Alert.alert(t('Lỗi'), t('Không tìm thấy thông tin phim'));
    }
  };

  const getBookingStatus = (booking: Booking) => {
    // Backend trả về bookingStatus, frontend có thể có status hoặc bookingStatus
    const status = (booking as any).status || (booking as any).bookingStatus || 'PENDING';
    
    if (status === 'CANCELLED') {
      return { text: t('Đã hủy'), color: '#FF6B6B' };
    }
    if (status === 'COMPLETED') {
      return { text: t('Đã hoàn thành'), color: '#4ECDC4' };
    }
    if (status === 'CONFIRMED') {
      return { text: t('Đã xác nhận'), color: '#4ECDC4' };
    }
    return { text: t('Đang chờ'), color: '#FFA500' };
  };

  const renderBooking = ({ item }: { item: Booking }) => {
    const status = getBookingStatus(item);
    const movie = item.showtime?.movie;
    const showtime = item.showtime;

    return (
      <TouchableOpacity
        style={[styles.bookingCard, { backgroundColor: currentTheme.card }]}
        onPress={() => handleBookingPress(item)}
      >
        {movie?.posterUrl && (
          <Image
            source={{ uri: movie.posterUrl }}
            style={styles.moviePoster}
            resizeMode="cover"
          />
        )}
        <View style={styles.bookingInfo}>
          <View style={styles.bookingHeader}>
            <Text style={[styles.movieTitle, { color: currentTheme.text }]} numberOfLines={1}>
              {movie?.title || t('Phim')}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusText}>{status.text}</Text>
            </View>
          </View>
          
          {item.bookingCode && (
            <Text style={[styles.bookingCode, { color: currentTheme.subtext }]}>
              {t('Mã đặt vé')}: {item.bookingCode}
            </Text>
          )}
          
          {showtime && (
            <>
              {showtime.showDate && (
                <Text style={[styles.bookingDetail, { color: currentTheme.subtext }]}>
                  📅 {new Date(showtime.showDate).toLocaleDateString(t('vi-VN'))}
                </Text>
              )}
              {showtime.startTime && (
                <Text style={[styles.bookingDetail, { color: currentTheme.subtext }]}>
                  🕐 {showtime.startTime.substring(0, 5)}
                </Text>
              )}
              {showtime.cinemaHall?.cinema?.name && (
                <Text style={[styles.bookingDetail, { color: currentTheme.subtext }]}>
                  🎭 {showtime.cinemaHall.cinema.name}
                </Text>
              )}
              {(showtime.cinemaHall?.name || showtime.cinemaHall?.hallName) && (
                <Text style={[styles.bookingDetail, { color: currentTheme.subtext }]}>
                  🪑 {showtime.cinemaHall.name || showtime.cinemaHall.hallName}
                </Text>
              )}
            </>
          )}
          
          {(item.bookingItems && item.bookingItems.length > 0) && (
            <Text style={[styles.bookingDetail, { color: currentTheme.subtext }]}>
              💺 {item.bookingItems
                .map(bi => bi.seat?.seatNumber || bi.seatId)
                .filter(Boolean)
                .join(', ')}
            </Text>
          )}
          {(!item.bookingItems || item.bookingItems.length === 0) && item.seats && item.seats.length > 0 && (
            <Text style={[styles.bookingDetail, { color: currentTheme.subtext }]}>
              💺 {item.seats.map(s => s.seat?.seatNumber || s.seatId).filter(Boolean).join(', ')}
            </Text>
          )}
          
          {item.totalAmount != null && (
            <Text style={[styles.totalAmount, { color: currentTheme.primary }]}>
              {t('Tổng tiền')}: {item.totalAmount.toLocaleString()} {t('VNĐ')}
            </Text>
          )}
          
          {item.bookingDate && (
            <Text style={[styles.bookingDate, { color: currentTheme.subtext }]}>
              {t('Ngày đặt')}: {new Date(item.bookingDate).toLocaleDateString(t('vi-VN'))}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centeredContainer, { backgroundColor: currentTheme.background }]}>
        <Text style={[styles.emptyText, { color: currentTheme.text }]}>
          {t('Vui lòng đăng nhập để xem lịch sử đặt vé')}
        </Text>
        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: currentTheme.primary }]}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>{t('Đăng nhập')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading && bookings.length === 0) {
    return (
      <View style={[styles.container, styles.centeredContainer, { backgroundColor: currentTheme.background }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={[styles.loadingText, { color: currentTheme.subtext }]}>
          {t('Đang tải lịch sử đặt vé...')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: currentTheme.primary }]}>← {t('Quay lại')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          {t('Lịch Sử Đặt Vé')}
        </Text>
        <Text style={[styles.headerSubtitle, { color: currentTheme.subtext }]}>
          {bookings.length} {t('đơn đặt vé')}
        </Text>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎫</Text>
            <Text style={[styles.emptyText, { color: currentTheme.text }]}>
              {t('Bạn chưa có đơn đặt vé nào')}
            </Text>
            <Text style={[styles.emptySubtext, { color: currentTheme.subtext }]}>
              {t('Hãy đặt vé để xem phim ngay!')}
            </Text>
            <TouchableOpacity
              style={[styles.browseButton, { backgroundColor: currentTheme.primary }]}
              onPress={() => router.push('/(tabs)/')}
            >
              <Text style={styles.browseButtonText}>{t('Khám phá phim')}</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  moviePoster: {
    width: 100,
    height: 150,
  },
  bookingInfo: {
    flex: 1,
    padding: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  bookingCode: {
    fontSize: 14,
    marginBottom: 4,
  },
  bookingDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  bookingDate: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

