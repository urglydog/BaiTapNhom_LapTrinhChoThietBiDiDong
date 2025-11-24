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
import { RootState, AppDispatch } from '../../src/store';
import { fetchFavourites, toggleFavourite } from '../../src/store/movieSlice';
import { Favourite, Movie } from '../../src/types';
import { useTranslation } from '../../src/localization';
import { lightTheme, darkTheme } from '../../src/themes';

export default function FavouritesTabScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { favourites, isLoading } = useSelector((state: RootState) => state.movie);
    const { theme } = useSelector((state: RootState) => state.theme);
    const t = useTranslation();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    // Refresh khi màn hình được focus
    useFocusEffect(
        React.useCallback(() => {
            dispatch(fetchFavourites());
        }, [dispatch])
    );

    useEffect(() => {
        dispatch(fetchFavourites());
    }, [dispatch]);

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
        // Refresh sau khi xóa
        await dispatch(fetchFavourites());
    };

    const renderMovie = ({ item }: { item: Favourite }) => {
        const movie = item.movie;
        // Nếu không có movie object, có thể cần load từ movieId
        if (!movie && !item.movieId) {
            console.warn('Favourite item missing movie:', item);
            return null;
        }

        // Nếu không có movie object nhưng có movieId, hiển thị placeholder
        if (!movie && item.movieId) {
            return (
                <TouchableOpacity
                    style={styles.movieCard}
                    onPress={() => router.push(`/movie-detail?movieId=${item.movieId}`)}
                    activeOpacity={0.8}
                >
                    <View style={styles.movieImageContainer}>
                        <View style={[styles.moviePoster, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ fontSize: 24 }}>🎬</Text>
                        </View>
                    </View>
                    <View style={styles.movieInfo}>
                        <Text style={styles.movieTitle} numberOfLines={2}>
                            {t('Đang tải...')}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        }

        if (!movie) return null;

        return (
            <TouchableOpacity
                style={[styles.movieCard, { backgroundColor: currentTheme.card }]}
                onPress={() => handleMoviePress(movie)}
                activeOpacity={0.8}
            >
                <View style={styles.movieImageContainer}>
                    <Image
                        source={{
                            uri: movie.posterUrl || 'https://via.placeholder.com/200x300/cccccc/666666?text=No+Image'
                        }}
                        style={styles.moviePoster}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={[styles.removeButton, { backgroundColor: currentTheme.error }]}
                        onPress={() => handleRemoveFavourite(movie.id)}
                    >
                        <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.movieInfo}>
                    <View style={styles.movieHeader}>
                        <Text style={[styles.movieTitle, { color: currentTheme.text }]} numberOfLines={2}>
                            {movie.title}
                        </Text>
                    </View>
                    {movie.genre && (
                        <Text style={[styles.movieGenre, { color: currentTheme.subtext }]} numberOfLines={1}>
                            {movie.genre}
                        </Text>
                    )}
                    {movie.duration != null && movie.duration > 0 && (
                        <Text style={[styles.movieDuration, { color: currentTheme.subtext }]}>{movie.duration} {t('phút')}</Text>
                    )}
                    <View style={styles.ratingContainer}>
                        {movie.rating != null && movie.rating > 0 && (
                            <Text style={[styles.rating, { color: currentTheme.primary }]}>⭐ {movie.rating.toFixed(1)}</Text>
                        )}
                        {movie.ageRating && (
                            <View style={[styles.ageRatingBadge, { backgroundColor: currentTheme.primary }]}>
                                <Text style={[styles.ageRating, { color: '#fff' }]}>{movie.ageRating}</Text>
                            </View>
                        )}
                    </View>
                    {movie.description && (
                        <Text style={[styles.movieDescription, { color: currentTheme.subtext }]} numberOfLines={2}>
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
                <ActivityIndicator size="large" color="#4f8cff" />
                <Text style={styles.loadingText}>{t('Đang tải phim yêu thích...')}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
            <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
                <Text style={[styles.headerTitle, { color: '#fff' }]}>{t('Phim Yêu Thích')}</Text>
                <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>
                    {favourites.length} {t('phim đã lưu')}
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
                    <View style={[styles.emptyContainer, { backgroundColor: currentTheme.background }]}>
                        <Text style={styles.emptyIcon}>❤️</Text>
                        <Text style={[styles.emptyText, { color: currentTheme.text }]}>
                            {t('Bạn chưa có phim yêu thích nào')}
                        </Text>
                        <Text style={[styles.emptySubtext, { color: currentTheme.subtext }]}>
                            {t('Thêm phim vào yêu thích để xem lại sau')}
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
    listContainer: {
        padding: 16,
    },
    movieCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    movieImageContainer: {
        width: 120,
        height: 180,
        position: 'relative',
    },
    moviePoster: {
        width: '100%',
        height: '100%',
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 107, 107, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    movieInfo: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    movieHeader: {
        marginBottom: 8,
    },
    movieTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    movieGenre: {
        fontSize: 14,
        color: '#4f8cff',
        marginBottom: 4,
        fontWeight: '500',
    },
    movieDuration: {
        fontSize: 13,
        color: '#888',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    rating: {
        fontSize: 14,
        color: '#FFA500',
        fontWeight: 'bold',
        marginRight: 12,
    },
    ageRatingBadge: {
        backgroundColor: '#4f8cff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    ageRating: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600',
    },
    movieDescription: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    browseButton: {
        backgroundColor: '#4f8cff',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#4f8cff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    browseButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

