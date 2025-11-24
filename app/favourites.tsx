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
import { fetchFavourites, toggleFavourite } from '../src/store/movieSlice';
import { Favourite, Movie } from '../src/types';
import { useTranslation } from '../src/localization';

export default function FavouritesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { favourites, isLoading } = useSelector((state: RootState) => state.movie);
  const t = useTranslation();

  useEffect(() => {
    dispatch(fetchFavourites());
  }, [dispatch]);

  // Refresh khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchFavourites());
    }, [dispatch])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchFavourites());
    setRefreshing(false);
  };

  const handleMoviePress = (movie: Movie) => {
    router.push(`/movie-detail?movieId=${movie.id}`);
  };

  const handleRemoveFavourite = async (movieId: number) => {
    await dispatch(toggleFavourite(movieId));
  };

  const renderMovie = ({ item }: { item: Favourite }) => {
    const movie = item.movie;
    // Nếu không có movie object, có thể cần load lại hoặc bỏ qua
    if (!movie) {
      console.warn('Favourite item missing movie:', item);
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.movieCard}
        onPress={() => handleMoviePress(movie)}
      >
        <View style={styles.movieImageContainer}>
          <Image
            source={{
              uri: movie.posterUrl || 'https://via.placeholder.com/200x300/cccccc/666666?text=No+Image'
            }}
            style={styles.moviePoster}
            resizeMode="cover"
          />
        </View>
        <View style={styles.movieInfo}>
          <View style={styles.movieHeader}>
            <Text style={styles.movieTitle} numberOfLines={2}>
              {movie.title}
            </Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFavourite(movie.id)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          {movie.genre && (
            <Text style={styles.movieGenre}>{movie.genre}</Text>
          )}
          {movie.duration != null && movie.duration > 0 && (
            <Text style={styles.movieDuration}>{movie.duration} {t('phút')}</Text>
          )}
          <View style={styles.ratingContainer}>
            {movie.rating != null && movie.rating > 0 && (
              <Text style={styles.rating}>⭐ {movie.rating.toFixed(1)}</Text>
            )}
            {movie.ageRating && (
              <Text style={styles.ageRating}>{movie.ageRating}</Text>
            )}
          </View>
          {movie.description && (
            <Text style={styles.movieDescription} numberOfLines={2}>
              {movie.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && favourites.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('Đang tải phim yêu thích...')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('Phim Yêu Thích')}</Text>
        <Text style={styles.headerSubtitle}>
          {favourites.length}{t(' phim đã lưu')}
        </Text>
      </View>

      <FlatList
        data={favourites}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyText}>
              {t('Bạn chưa có phim yêu thích nào')}
            </Text>
            <Text style={styles.emptySubtext}>
              {t('Thêm phim vào yêu thích để xem lại sau')}
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  listContainer: {
    padding: 16,
  },
  movieCard: {
    flexDirection: 'row',
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
  movieImageContainer: {
    width: 120,
    height: 180,
  },
  moviePoster: {
    width: '100%',
    height: '100%',
  },
  movieInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  movieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  movieGenre: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  movieDuration: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: 'bold',
  },
  ageRating: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  movieDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    lineHeight: 16,
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
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

