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
    Dimensions,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { movieService } from '../../src/services/movieService';
import { Movie } from '../../src/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function MoviesScreen() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'showing' | 'upcoming'>('all');
    const router = useRouter();

    const categories = [
        { key: 'all' as const, label: 'Tất cả', icon: '🎬' },
        { key: 'showing' as const, label: 'Đang chiếu', icon: '🎞️' },
        { key: 'upcoming' as const, label: 'Sắp chiếu', icon: '📅' },
    ];

    const fetchMovies = async () => {
        try {
            setIsLoading(true);
            let moviesList: Movie[] = [];

            switch (selectedCategory) {
                case 'showing':
                    moviesList = await movieService.getCurrentlyShowingMovies();
                    break;
                case 'upcoming':
                    moviesList = await movieService.getUpcomingMovies();
                    break;
                default:
                    moviesList = await movieService.getMovies();
            }

            setMovies(moviesList);
        } catch (error: any) {
            console.error('Error fetching movies:', error);
            Alert.alert(
                'Lỗi kết nối',
                error?.message || 'Không thể tải danh sách phim. Vui lòng thử lại.',
                [
                    { text: 'Thử lại', onPress: () => fetchMovies() },
                    { text: 'OK', style: 'cancel' },
                ]
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, [selectedCategory]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchMovies();
        setRefreshing(false);
    };

    const handleMoviePress = (movie: Movie) => {
        router.push(`/movie-detail?movieId=${movie.id}`);
    };

    // Xác định trạng thái phim (đang chiếu hay sắp chiếu)
    const getMovieStatus = (movie: Movie): 'showing' | 'upcoming' | null => {
        if (!movie.releaseDate) return null;
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const releaseDate = new Date(movie.releaseDate);
        releaseDate.setHours(0, 0, 0, 0);
        
        if (releaseDate > now) {
            return 'upcoming';
        }
        
        if (movie.endDate) {
            const endDate = new Date(movie.endDate);
            endDate.setHours(23, 59, 59, 999);
            if (now <= endDate) {
                return 'showing';
            }
        } else if (releaseDate <= now) {
            return 'showing';
        }
        
        return null;
    };

    const renderMovie = ({ item }: { item: Movie }) => {
        const movieStatus = getMovieStatus(item);
        
        return (
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
                    {movieStatus === 'showing' && (
                        <View style={[styles.statusBadge, styles.showingBadge]}>
                            <Text style={styles.statusBadgeText}>🎞️ Đang chiếu</Text>
                        </View>
                    )}
                    {movieStatus === 'upcoming' && (
                        <View style={[styles.statusBadge, styles.upcomingBadge]}>
                            <Text style={styles.statusBadgeText}>📅 Sắp chiếu</Text>
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
                {movieStatus === 'upcoming' && item.releaseDate && (
                    <Text style={styles.releaseDateText}>
                        Khởi chiếu: {new Date(item.releaseDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}
                    </Text>
                )}
                {item.ageRating && (
                    <View style={styles.ageRatingContainer}>
                        <Text style={styles.ageRating}>{item.ageRating}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
        );
    };

    if (isLoading && movies.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f8cff" />
                <Text style={styles.loadingText}>Đang tải danh sách phim...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Danh Sách Phim</Text>
                <Text style={styles.headerSubtitle}>Khám phá bộ sưu tập phim đa dạng</Text>
            </View>

            <View style={styles.categoryContainer}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.key}
                        style={[
                            styles.categoryButton,
                            selectedCategory === category.key && styles.categoryButtonActive,
                        ]}
                        onPress={() => setSelectedCategory(category.key)}
                    >
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                        <Text
                            style={[
                                styles.categoryLabel,
                                selectedCategory === category.key && styles.categoryLabelActive,
                            ]}
                        >
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                ))}
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
                        <Text style={styles.emptyIcon}>🎬</Text>
                        <Text style={styles.emptyText}>
                            {selectedCategory === 'showing'
                                ? 'Hiện không có phim đang chiếu'
                                : selectedCategory === 'upcoming'
                                    ? 'Hiện không có phim sắp chiếu'
                                    : 'Không có phim nào'}
                        </Text>
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
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
    },
    categoryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    categoryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    categoryButtonActive: {
        backgroundColor: '#4f8cff',
    },
    categoryIcon: {
        fontSize: 18,
        marginRight: 6,
    },
    categoryLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    categoryLabelActive: {
        color: 'white',
    },
    listContainer: {
        paddingHorizontal: 12,
        paddingBottom: 16,
        paddingTop: 8,
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
        shadowOffset: { width: 0, height: 2 },
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
    statusBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    showingBadge: {
        backgroundColor: '#10b981', // Green
    },
    upcomingBadge: {
        backgroundColor: '#f59e0b', // Orange
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
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
        marginBottom: 4,
    },
    releaseDateText: {
        fontSize: 12,
        color: '#f59e0b',
        fontWeight: '600',
        marginBottom: 4,
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
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
});

