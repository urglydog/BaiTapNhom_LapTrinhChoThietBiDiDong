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
import { fetchUserBookings } from '../src/store/bookingSlice';
import { Booking, Movie } from '../src/types';
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';

export default function WatchedMoviesScreen() {
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

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(fetchUserBookings());
        setRefreshing(false);
    };

    // Lấy danh sách phim duy nhất từ bookings (đã xem/đã đặt)
    const getWatchedMovies = (): Movie[] => {
        const movieMap = new Map<number, Movie>();
        bookings.forEach((booking) => {
            if (booking.showtime?.movie) {
                const movie = booking.showtime.movie;
                if (!movieMap.has(movie.id)) {
                    movieMap.set(movie.id, movie);
                }
            }
        });
        return Array.from(movieMap.values());
    };

    const watchedMovies = getWatchedMovies();

    const handleMoviePress = (movie: Movie) => {
        router.push(`/movie-detail?movieId=${movie.id}`);
    };

    const renderMovie = ({ item }: { item: Movie }) => {
        return (
            <TouchableOpacity
                style={[styles.movieCard, { backgroundColor: currentTheme.card }]}
                onPress={() => handleMoviePress(item)}
            >
                <View style={styles.movieImageContainer}>
                    <Image
                        source={{
                            uri: item.posterUrl || 'https://via.placeholder.com/200x300/cccccc/666666?text=No+Image'
                        }}
                        style={styles.moviePoster}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.movieInfo}>
                    <Text style={[styles.movieTitle, { color: currentTheme.text }]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    {item.genre && (
                        <Text style={[styles.movieGenre, { color: currentTheme.subtext }]}>{item.genre}</Text>
                    )}
                    {item.duration != null && item.duration > 0 && (
                        <Text style={[styles.movieDuration, { color: currentTheme.subtext }]}>
                            {item.duration} {t('phút')}
                        </Text>
                    )}
                    <View style={styles.ratingContainer}>
                        {item.rating != null && item.rating > 0 && (
                            <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
                        )}
                        {item.ageRating && (
                            <Text style={[styles.ageRating, { color: currentTheme.subtext }]}>
                                {item.ageRating}
                            </Text>
                        )}
                    </View>
                    {item.description && (
                        <Text style={[styles.movieDescription, { color: currentTheme.subtext }]} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (!user) {
        return (
            <View style={[styles.container, styles.centerContainer, { backgroundColor: currentTheme.background }]}>
                <Text style={[styles.emptyText, { color: currentTheme.subtext }]}>
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

    if (isLoading && watchedMovies.length === 0) {
        return (
            <View style={[styles.container, styles.centerContainer, { backgroundColor: currentTheme.background }]}>
                <ActivityIndicator size="large" color={currentTheme.primary} />
                <Text style={[styles.loadingText, { color: currentTheme.subtext }]}>
                    {t('Đang tải phim đã xem...')}
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
                    {t('Phim đã xem')}
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
                            {t('Hãy đặt vé và xem phim để thêm vào danh sách này!')}
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
    centerContainer: {
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
        marginTop: 4,
    },
    movieDuration: {
        fontSize: 12,
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
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    movieDescription: {
        fontSize: 12,
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
    loadingText: {
        marginTop: 16,
        fontSize: 16,
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

