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
import { useAppSelector } from '@/src/hooks/redux';
import { darkTheme, lightTheme } from '@/src/themes';
import { useTranslation } from 'react-i18next';

export default function CinemasScreen() {
  const { t } = useTranslation();
  const [selectedCinema, setSelectedCinema] = useState<number | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { cinemas } = useSelector((state: RootState) => state.movie);
  const { language } = useAppSelector((state) => state.language);
  const { theme } = useAppSelector((state) => state.theme);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(currentTheme);

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
          {item.movie?.title || t('Movie')}
        </Text>
        {item.startTime && item.endTime && (
          <Text style={styles.showtimeTime}>
            {item.startTime} - {item.endTime}
          </Text>
        )}
        {item.showDate && (
          <Text style={styles.showtimeDate}>
            {new Date(item.showDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
          </Text>
        )}
      </View>
      <View style={styles.showtimePriceContainer}>
        {item.price != null && (
          <Text style={styles.showtimePrice}>
            {item.price.toLocaleString()} VNĐ
          </Text>
        )}
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => router.push(`/booking?showtimeId=${item.id}`)}
        >
          <Text style={styles.bookButtonText}>{t('Book ticket')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('Cinemas')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('Select a cinema to see the showtimes')}
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
            <Text style={styles.emptyText}>{t('No cinemas found')}</Text>
          </View>
        }
      />

      {selectedCinema && (
        <View style={styles.showtimesContainer}>
          <View style={styles.showtimesHeader}>
            <Text style={styles.showtimesTitle}>{t('Showtimes')}</Text>
            <TouchableOpacity onPress={() => setSelectedCinema(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          {loadingShowtimes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={currentTheme.primary} />
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
                    {t('No showtimes found')}
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

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.primary,
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
    backgroundColor: theme.card,
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
    borderColor: theme.primary,
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
    color: theme.text,
    marginBottom: 4,
  },
  cinemaAddress: {
    fontSize: 14,
    color: theme.text,
    marginBottom: 2,
  },
  cinemaCity: {
    fontSize: 14,
    color: theme.text,
    marginBottom: 4,
  },
  cinemaPhone: {
    fontSize: 14,
    color: theme.primary,
    marginBottom: 8,
  },
  cinemaDescription: {
    fontSize: 12,
    color: theme.text,
    marginTop: 4,
  },
  showtimesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.card,
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
    borderBottomColor: theme.border,
  },
  showtimesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  closeButton: {
    fontSize: 24,
    color: theme.text,
  },
  showtimesList: {
    padding: 16,
  },
  showtimeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.background,
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
    color: theme.text,
    marginBottom: 4,
  },
  showtimeTime: {
    fontSize: 14,
    color: theme.text,
    marginBottom: 2,
  },
  showtimeDate: {
    fontSize: 12,
    color: theme.text,
  },
  showtimePriceContainer: {
    alignItems: 'flex-end',
  },
  showtimePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: theme.primary,
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
    color: theme.text,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
});

