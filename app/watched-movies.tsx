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
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { fetchUserBookings } from '../src/store/bookingSlice';
import { Booking, Movie } from '../src/types';
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';

export default function WatchedMoviesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { bookings } = useSelector((state: RootState) => state.booking);
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.theme);
  const t = useTranslation();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // Lấy danh sách phim đã đặt vé (unique movies)
  const getWatchedMovies = (): Movie[] => {
    const movieMap = new Map<number, Movie>();
    
    bookings.forEach((booking) => {
      const movie = booking.showtime?.movie;
      const movieId = movie?.id || booking.showtime?.movieId;
      
      if (movieId) {
        // Chỉ lấy những booking đã hoàn thành hoặc đã chiếu
        const showtime = booking.showtime;
        if (showtime?.showDate) {
          try {
            const showDate = new Date(showtime.showDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Nếu ngày chiếu đã qua (bao gồm cả hôm nay) hoặc booking đã hoàn thành
            // Cho phép cả booking PENDING nếu ngày chiếu đã qua
            if (showDate <= today || booking.status === 'COMPLETED' || booking.status === 'CONFIRMED') {
              // Nếu có movie object đầy đủ thì dùng, nếu không thì tạo object tối thiểu
              if (movie && movie.title) {
                movieMap.set(movieId, movie);
              } else if (movieId) {
                // Tạo movie object tối thiểu nếu không có
                movieMap.set(movieId, {
                  id: movieId,
                  title: t('Phim'),
                } as Movie);
              }
            }
          } catch (e) {
            console.error('Error parsing showDate:', e);
          }
        }
      }
    });
    
    return Array.from(movieMap.values());
  };

  const watchedMovies = getWatchedMovies();

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

  const handleMoviePress = (movie: Movie) => {
    router.push(`/movie-detail?movieId=${movie.id}`);
  };

  const renderMovie = ({ item }: { item: Movie }) => {
    // Tìm booking gần nhất của phim này
    const movieBookings = bookings.filter(
      b => b.showtime?.movie?.id === item.id || b.showtime?.movieId === item.id
    );
    const latestBooking = movieBookings.sort((a, b) => {
      const dateA = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
      const dateB = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
      return dateB - dateA;
    })[0];

    return (
      <TouchableOpacity
        style={[styles.movieCard, { backgroundColor: currentTheme.card }]}
        onPress={() => handleMoviePress(item)}
      >
        <View style={styles.movieImageContainer}>
          {item.posterUrl ? (
            <Image
              source={{ uri: item.posterUrl }}
              style={styles.moviePoster}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderPoster, { backgroundColor: currentTheme.background }]}>
              <Text style={styles.placeholderText}>📽️</Text>
            </View>
          )}
        </View>
        <View style={styles.movieInfo}>
          <Text style={[styles.movieTitle, { color: currentTheme.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.genre && (
            <Text style={[styles.movieGenre, { color: currentTheme.subtext }]}>
              {item.genre}
            </Text>
          )}
          {latestBooking?.showtime?.showDate && (
            <Text style={[styles.watchedDate, { color: currentTheme.subtext }]}>
              {t('Đã xem')}: {new Date(latestBooking.showtime.showDate).toLocaleDateString(t('vi-VN'))}
            </Text>
          )}
          {item.rating != null && item.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centeredContainer, { backgroundColor: currentTheme.background }]}>
        <Text style={[styles.emptyText, { color: currentTheme.text }]}>
          {t('Vui lòng đăng nhập để xem phim đã xem')}
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

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: currentTheme.primary }]}>← {t('Quay lại')}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          {t('Phim Đã Xem')}
        </Text>
        <Text style={[styles.headerSubtitle, { color: currentTheme.subtext }]}>
          {watchedMovies.length} {t('phim')}
        </Text>
      </View>

      <FlatList
        data={watchedMovies}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎬</Text>
            <Text style={[styles.emptyText, { color: currentTheme.text }]}>
              {t('Bạn chưa xem phim nào')}
            </Text>
            <Text style={[styles.emptySubtext, { color: currentTheme.subtext }]}>
              {t('Hãy đặt vé và xem phim để thêm vào danh sách!')}
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
  movieCard: {
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
  movieImageContainer: {
    width: 120,
    height: 180,
  },
  moviePoster: {
    width: '100%',
    height: '100%',
  },
  placeholderPoster: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  movieInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  movieGenre: {
    fontSize: 14,
    marginBottom: 4,
  },
  watchedDate: {
    fontSize: 12,
    marginTop: 8,
  },
  ratingContainer: {
    marginTop: 8,
  },
  rating: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: 'bold',
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
});

