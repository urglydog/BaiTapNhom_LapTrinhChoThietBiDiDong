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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { fetchCinemas } from '../src/store/movieSlice';
import { Cinema, Showtime } from '../src/types';
import { movieService } from '../src/services/movieService';
import { useTranslation } from '../src/localization';

export default function CinemasScreen() {
  const [selectedCinema, setSelectedCinema] = useState<number | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [groupedShowtimes, setGroupedShowtimes] = useState<{ [movieId: number]: { movie: any; showtimes: Showtime[] } }>({});
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { cinemas } = useSelector((state: RootState) => state.movie);
  const t = useTranslation();
    console.log("t('Cinema')", t('Cinema'));

  useEffect(() => {
    dispatch(fetchCinemas());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCinemas());
    setRefreshing(false);
  };

  const handleCinemaPress = async (cinema: Cinema) => {
    setSelectedCinema(cinema.id);
    setLoadingShowtimes(true);
    try {
      const cinemaShowtimes = await movieService.getCinemaShowtimes(cinema.id);
      setShowtimes(cinemaShowtimes);
      
      // Nhóm showtimes theo phim
      const grouped: { [movieId: number]: { movie: any; showtimes: Showtime[] } } = {};
      cinemaShowtimes.forEach((showtime) => {
        const movieId = showtime.movieId || showtime.movie?.id;
        if (movieId) {
          if (!grouped[movieId]) {
            grouped[movieId] = {
              movie: showtime.movie || { id: movieId, title: t('Phim') },
              showtimes: []
            };
          }
          grouped[movieId].showtimes.push(showtime);
        }
      });
      setGroupedShowtimes(grouped);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      setShowtimes([]);
      setGroupedShowtimes({});
    } finally {
      setLoadingShowtimes(false);
    }
  };

  const handleShowtimePress = (showtime: Showtime) => {
    // Chuyển đến trang chọn ghế thay vì movie detail
    const movie = showtime.movie;
    router.push({
      pathname: '/seat-selection',
      params: {
        showtimeId: String(showtime.id),
        movieId: String(showtime.movieId || movie?.id || ''),
        movieTitle: movie?.title || t('Phim'),
        cinemaName: showtime.cinemaHall?.cinema?.name || t('Cinema'),
        hallName: showtime.cinemaHall?.name || t('Phòng chiếu'),
        showDate: showtime.showDate || '',
        showTime: showtime.startTime || '',
      }
    });
  };

  const renderCinema = ({ item }: { item: Cinema }) => (
    <TouchableOpacity
      style={[
        styles.cinemaCard,
        selectedCinema === item.id && styles.selectedCinemaCard,
      ]}
      onPress={() => handleCinemaPress(item)}
    >
      <View style={styles.cinemaImageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.cinemaImage}
            resizeMode="cover"
            onError={() => console.log('Error loading cinema image:', item.imageUrl)}
          />
        ) : (
          <View style={[styles.cinemaImage, styles.cinemaImagePlaceholder]}>
            <Text style={styles.cinemaImagePlaceholderText}>🎬</Text>
            <Text style={styles.cinemaImagePlaceholderLabel}>{t('Cinema')}</Text>
          </View>
        )}
      </View>
      <View style={styles.cinemaInfo}>
        <Text style={styles.cinemaName}>{item.name || t('Cinema')}</Text>
        {item.address && (
          <Text style={styles.cinemaAddress}>{item.address}</Text>
        )}
        {item.city && (
          <Text style={styles.cinemaCity}>{item.city}</Text>
        )}
        {item.phone && (
          <Text style={styles.cinemaPhone}>📞 {item.phone}</Text>
        )}
        {item.description && (
          <Text style={styles.cinemaDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

const renderShowtime = ({ item }: { item: Showtime }) => (
    <TouchableOpacity
      style={styles.showtimeCard}
      onPress={() => handleShowtimePress(item)}
    >
      <View style={styles.showtimeInfo}>
        <Text style={styles.showtimeMovie}>
          {item.movie?.title || t('Phim')}
        </Text>
        {item.startTime && item.endTime && (
          <Text style={styles.showtimeTime}>
            {item.startTime} - {item.endTime}
          </Text>
        )}
        {item.showDate && (
          <Text style={styles.showtimeDate}>
            {new Date(item.showDate).toLocaleDateString(t('vi-VN'))}
          </Text>
  const renderMovieGroup = (movieId: number, data: { movie: any; showtimes: Showtime[] }) => (
    <View style={styles.movieGroup} key={movieId}>
      <View style={styles.movieGroupHeader}>
        {data.movie.posterUrl && (
          <Image
            source={{ uri: data.movie.posterUrl }}
            style={styles.moviePoster}
            resizeMode="cover"
          />
        )}
        <View style={styles.movieGroupInfo}>
          <Text style={styles.movieGroupTitle}>{data.movie.title || t('Phim')}</Text>
          {data.movie.genre && (
            <Text style={styles.movieGroupGenre}>{data.movie.genre}</Text>
          )}
        </View>
      </View>
      <View style={styles.showtimesGrid}>
        {data.showtimes.map((showtime) => (
          <TouchableOpacity
            key={showtime.id}
            style={styles.showtimeButton}
            onPress={() => handleShowtimePress(showtime)}
          >
            <Text style={styles.showtimeButtonTime}>
              {showtime.startTime ? showtime.startTime.substring(0, 5) : ''}
            </Text>
            {showtime.price != null && (
              <Text style={styles.showtimeButtonPrice}>
                {showtime.price.toLocaleString()} {t('VNĐ')}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('Cinema')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('Chọn rạp để xem lịch chiếu')}
        </Text>
      </View>

      <FlatList
        data={cinemas}
        renderItem={renderCinema}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cinemaList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('Không có rạp chiếu nào')}</Text>
          </View>
        }
      />

      {selectedCinema && (
        <View style={styles.showtimesContainer}>
          <View style={styles.showtimesHeader}>
            <Text style={styles.showtimesTitle}>{t('Lịch Chiếu')}</Text>
            <TouchableOpacity onPress={() => setSelectedCinema(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          {loadingShowtimes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <ScrollView style={styles.showtimesList} contentContainerStyle={styles.showtimesListContent}>
              {Object.keys(groupedShowtimes).length > 0 ? (
                Object.entries(groupedShowtimes).map(([movieId, data]) =>
                  renderMovieGroup(Number(movieId), data)
                )
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {t('Không có suất chiếu nào')}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  cinemaList: {
    padding: 16,
  },
  cinemaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    // For web compatibility, use boxShadow instead of shadow* properties
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  selectedCinemaCard: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  cinemaImageContainer: {
    height: 150,
    width: '100%',
  },
  cinemaImage: {
    width: '100%',
    height: '100%',
  },
  cinemaInfo: {
    padding: 16,
  },
  cinemaName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cinemaAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cinemaCity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cinemaPhone: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  cinemaDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  showtimesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    // For web compatibility, use boxShadow instead of shadow* properties
    boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  showtimesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  showtimesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  showtimesList: {
    flex: 1,
  },
  showtimesListContent: {
    padding: 16,
  },
  movieGroup: {
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
  },
  movieGroupHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  moviePoster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  movieGroupInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  movieGroupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  movieGroupGenre: {
    fontSize: 14,
    color: '#666',
  },
  showtimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  showtimeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    marginBottom: 8,
  },
  showtimeButtonTime: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  showtimeButtonPrice: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  cinemaImagePlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cinemaImagePlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  cinemaImagePlaceholderLabel: {
    fontSize: 14,
    color: '#666',
  },
  showtimeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  showtimeInfo: {
    flex: 1,
  },
  showtimeMovie: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  showtimeTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  showtimeDate: {
    fontSize: 12,
    color: '#999',
  },
  showtimePriceContainer: {
    alignItems: 'flex-end',
  },
  showtimePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
});

