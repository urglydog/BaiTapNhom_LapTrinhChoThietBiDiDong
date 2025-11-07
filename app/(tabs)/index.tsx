import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { movieService } from '../../src/services/movieService';
import { Movie } from '../../src/types';

export default function HomeScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      setImageErrors(new Set()); // Reset image errors khi fetch lại
      const response = await movieService.getMovies(0, 100); // Lấy nhiều phim hơn
      console.log('Movies response:', JSON.stringify(response, null, 2));

      // Xử lý response có thể là paginated hoặc array trực tiếp
      let moviesList: Movie[] = [];
      if (Array.isArray(response)) {
        moviesList = response;
      } else if (response?.content && Array.isArray(response.content)) {
        moviesList = response.content;
      } else if (response?.result) {
        // Nếu có result wrapper
        if (Array.isArray(response.result)) {
          moviesList = response.result;
        } else if (response.result?.content && Array.isArray(response.result.content)) {
          moviesList = response.result.content;
        }
      }

      // Loại bỏ duplicate dựa trên id - sử dụng Map để đảm bảo unique
      const moviesMap = new Map<number, Movie>();
      moviesList.forEach((movie) => {
        if (movie && movie.id) {
          // Chỉ lấy phim đầu tiên nếu có duplicate id
          if (!moviesMap.has(movie.id)) {
            moviesMap.set(movie.id, movie);
          }
        }
      });

      const uniqueMovies = Array.from(moviesMap.values());
      console.log(`Loaded ${uniqueMovies.length} unique movies from ${moviesList.length} total`);

      setMovies(uniqueMovies);
    } catch (error) {
      console.error('Error fetching movies:', error);
      // Chỉ set empty nếu không phải đang refresh
      if (!refreshing) {
        setMovies([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.trim()) {
      try {
        setIsLoading(true);
        // Truyền danh sách phim hiện tại để tìm kiếm local nhanh hơn
        const response = await movieService.searchMovies(text, movies);

        // searchMovies đã trả về Movie[] rồi, không cần xử lý thêm
        // Loại bỏ duplicate
        const moviesMap = new Map<number, Movie>();
        response.forEach((movie) => {
          if (movie && movie.id) {
            if (!moviesMap.has(movie.id)) {
              moviesMap.set(movie.id, movie);
            }
          }
        });
        const uniqueMovies = Array.from(moviesMap.values());

        setMovies(uniqueMovies);
      } catch (error: any) {
        console.error('Search error:', error);
        // Hiển thị thông báo lỗi cho user
        setMovies([]);
        Alert.alert('Lỗi', error?.message || 'Không thể tìm kiếm phim. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    } else {
      fetchMovies();
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setImageErrors(new Set()); // Reset image errors khi refresh
      const response = await movieService.getMovies(0, 100);

      // Xử lý response
      let moviesList: Movie[] = [];
      if (Array.isArray(response)) {
        moviesList = response;
      } else if (response?.content && Array.isArray(response.content)) {
        moviesList = response.content;
      } else if (response?.result) {
        if (Array.isArray(response.result)) {
          moviesList = response.result;
        } else if (response.result?.content && Array.isArray(response.result.content)) {
          moviesList = response.result.content;
        }
      }

      // Loại bỏ duplicate
      const moviesMap = new Map<number, Movie>();
      moviesList.forEach((movie) => {
        if (movie && movie.id) {
          if (!moviesMap.has(movie.id)) {
            moviesMap.set(movie.id, movie);
          }
        }
      });

      const uniqueMovies = Array.from(moviesMap.values());
      setMovies(uniqueMovies);
    } catch (error) {
      console.error('Error refreshing movies:', error);
      // Không set empty khi refresh, giữ nguyên danh sách cũ
    } finally {
      setRefreshing(false);
    }
  };

  const handleMoviePress = (movie: Movie) => {
    router.push(`/movie-detail?movieId=${movie.id}`);
  };

  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = (movieId: number) => {
    setImageErrors((prev) => new Set(prev).add(movieId));
  };

  const renderMovie = ({ item }: { item: Movie }) => {
    // Xử lý URL ảnh - đảm bảo là URL hợp lệ
    let imageUri = item.posterUrl || '';

    // Kiểm tra URL hợp lệ
    if (imageUri) {
      // Nếu không bắt đầu bằng http, thử thêm https://
      if (!imageUri.startsWith('http://') && !imageUri.startsWith('https://')) {
        imageUri = '';
      }
      // Xử lý .webp - React Native có thể cần hỗ trợ đặc biệt
      // Giữ nguyên URL vì Cloudinary hỗ trợ .webp tốt
    }

    const finalImageUri = imageUri || 'https://via.placeholder.com/300x400/cccccc/666666?text=No+Image';
    const hasImageError = imageErrors.has(item.id);

    return (
      <TouchableOpacity
        style={styles.movieCard}
        onPress={() => handleMoviePress(item)}
      >
        <View style={styles.movieImageContainer}>
          {!hasImageError ? (
            <Image
              source={{ uri: finalImageUri }}
              style={styles.moviePoster}
              resizeMode="cover"
              onError={() => {
                console.log('Image load error for movie:', item.title, finalImageUri);
                handleImageError(item.id);
              }}
            />
          ) : (
            <View style={[styles.moviePoster, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>📽️</Text>
              <Text style={styles.placeholderTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.movieGenre}>{item.genre}</Text>
          <Text style={styles.movieDuration}>{item.duration} phút</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.rating}</Text>
            <Text style={styles.ageRating}>{item.ageRating}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải danh sách phim...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://i.imgur.com/0y0y0y0.png' }}
              style={styles.avatar}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()}, Chào mừng bạn!</Text>
            <Text style={styles.role}>Khám phá những bộ phim hay</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm phim..."
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <FlatList
        data={movies}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !refreshing ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading ? 'Đang tải...' : 'Không tìm thấy phim nào'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6fb',
  },
  header: {
    backgroundColor: '#4f8cff',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#4f8cff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fff',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  role: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#4f8cff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
    color: '#4f8cff',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    paddingVertical: 4,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  movieCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 8,
    width: '48%',
    shadowColor: '#4f8cff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  movieImageContainer: {
    height: 180,
    backgroundColor: '#eaf0fa',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  moviePoster: {
    width: '100%',
    height: '100%',
  },
  movieInfo: {
    padding: 14,
  },
  movieTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  movieGenre: {
    fontSize: 14,
    color: '#4f8cff',
    marginBottom: 2,
    fontWeight: '500',
  },
  movieDuration: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: 13,
    color: '#ffb300',
    fontWeight: 'bold',
  },
  ageRating: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#4f8cff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
    color: '#4f8cff',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f6fb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  placeholderImage: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
