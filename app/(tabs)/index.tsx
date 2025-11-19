import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { movieService } from '../../src/services/movieService';
import { Movie } from '../../src/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;
const SEARCH_DEBOUNCE_DELAY = 500; // 500ms delay

export default function HomeScreen() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]); // Lưu danh sách phim gốc
  const [movies, setMovies] = useState<Movie[]>([]); // Danh sách phim hiển thị
  const [isLoading, setIsLoading] = useState(true); // Loading ban đầu
  const [isSearching, setIsSearching] = useState(false); // Loading khi search
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const moviesList = await movieService.getMovies();
      setAllMovies(moviesList);
      setMovies(moviesList);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Client-side search ngay lập tức
  const performClientSearch = (query: string) => {
    if (!query.trim()) {
      setMovies(allMovies);
      return;
    }

    const queryLower = query.toLowerCase().trim();
    const filtered = allMovies.filter((movie: Movie) => 
      movie.title?.toLowerCase().includes(queryLower) ||
      movie.genre?.toLowerCase().includes(queryLower) ||
      movie.director?.toLowerCase().includes(queryLower) ||
      movie.cast?.toLowerCase().includes(queryLower)
    );
    setMovies(filtered);
  };

  // API search với debounce
  const performApiSearch = async (query: string) => {
    if (!query.trim()) {
      setMovies(allMovies);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await movieService.searchMovies(query, allMovies);
      setMovies(response);
    } catch (error: any) {
      console.error('Search error:', error);
      // Nếu API search lỗi, vẫn giữ kết quả client-side search
      // Không hiển thị alert để không làm gián đoạn UX
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    
    // Client-side search ngay lập tức để UX mượt mà
    performClientSearch(text);

    // Clear timeout cũ nếu có
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce API search
    if (text.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performApiSearch(text);
      }, SEARCH_DEBOUNCE_DELAY);
    } else if (!text.trim()) {
      // Nếu xóa hết text, reset về danh sách gốc
      setMovies(allMovies);
      setIsSearching(false);
    }
  };

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMovies();
    // Reset search khi refresh
    if (searchText.trim()) {
      performClientSearch(searchText);
    }
    setRefreshing(false);
  };

  const handleMoviePress = (movie: Movie) => {
    router.push(`/movie-detail?movieId=${movie.id}`);
  };

  const renderMovie = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => handleMoviePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.movieImageContainer}>
        {item.posterUrl ? (
          <Image
            source={{ uri: item.posterUrl }}
            style={styles.posterImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📽️</Text>
            <Text style={styles.placeholderSubtext}>Không có ảnh</Text>
          </View>
        )}
        {item.rating != null && item.rating > 0 && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingBadgeText}>⭐ {item.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.genre && (
          <Text style={styles.movieGenre} numberOfLines={1}>
            {item.genre}
          </Text>
        )}
        {item.duration != null && item.duration > 0 && (
          <Text style={styles.movieDuration}>{item.duration} phút</Text>
        )}
        {item.ageRating && (
          <View style={styles.ageRatingContainer}>
            <Text style={styles.ageRating}>{item.ageRating}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.greeting}>
          {getGreeting()}, Chào mừng bạn!
        </Text>
        <Text style={styles.role}>Khám phá những bộ phim hay</Text>
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
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {isSearching && (
            <ActivityIndicator 
              size="small" 
              color="#4f8cff" 
              style={styles.searchLoading}
            />
          )}
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
          <View style={styles.emptyContainer}>
            {searchText.trim() ? (
              <>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>
                  Không tìm thấy phim nào với từ khóa "{searchText}"
                </Text>
                <Text style={styles.emptySubtext}>
                  Thử tìm kiếm với từ khóa khác
                </Text>
              </>
            ) : (
              <Text style={styles.emptyText}>
                Không có phim nào
              </Text>
            )}
          </View>
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
  searchLoading: {
    marginLeft: 8,
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
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    width: CARD_WIDTH,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  movieImageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.5,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#999',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  movieInfo: {
    padding: 14,
  },
  movieTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
    minHeight: 40,
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
  ageRatingContainer: {
    marginTop: 4,
  },
  ageRating: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#4f8cff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
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
});
