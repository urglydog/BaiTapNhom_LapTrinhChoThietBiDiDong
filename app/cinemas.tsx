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
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { fetchCinemas } from '../src/store/movieSlice';
import { Cinema, Showtime } from '../src/types';
import { movieService } from '../src/services/movieService';

export default function CinemasScreen() {
  const [selectedCinema, setSelectedCinema] = useState<number | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { cinemas } = useSelector((state: RootState) => state.movie);

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
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      setShowtimes([]);
    } finally {
      setLoadingShowtimes(false);
    }
  };

  const handleShowtimePress = (showtime: Showtime) => {
    router.push(`/movie-detail?movieId=${showtime.movieId}`);
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
        <Image
          source={{
            uri: item.imageUrl || 'https://via.placeholder.com/300x200/cccccc/666666?text=Cinema'
          }}
          style={styles.cinemaImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.cinemaInfo}>
        <Text style={styles.cinemaName}>{item.name}</Text>
        <Text style={styles.cinemaAddress}>{item.address}</Text>
        <Text style={styles.cinemaCity}>{item.city}</Text>
        <Text style={styles.cinemaPhone}>📞 {item.phone}</Text>
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
          {item.movie?.title || 'Phim'}
        </Text>
        <Text style={styles.showtimeTime}>
          {item.startTime} - {item.endTime}
        </Text>
        <Text style={styles.showtimeDate}>
          {new Date(item.showDate).toLocaleDateString('vi-VN')}
        </Text>
      </View>
      <View style={styles.showtimePriceContainer}>
        <Text style={styles.showtimePrice}>
          {item.price.toLocaleString()} VNĐ
        </Text>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push(`/booking?showtimeId=${item.id}`)}
        >
          <Text style={styles.bookButtonText}>Đặt vé</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rạp Chiếu Phim</Text>
        <Text style={styles.headerSubtitle}>
          Chọn rạp để xem lịch chiếu
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
            <Text style={styles.emptyText}>Không có rạp chiếu nào</Text>
          </View>
        }
      />

      {selectedCinema && (
        <View style={styles.showtimesContainer}>
          <View style={styles.showtimesHeader}>
            <Text style={styles.showtimesTitle}>Lịch Chiếu</Text>
            <TouchableOpacity onPress={() => setSelectedCinema(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          {loadingShowtimes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <FlatList
              data={showtimes}
              renderItem={renderShowtime}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.showtimesList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    Không có suất chiếu nào
                  </Text>
                </View>
              }
            />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    padding: 16,
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

