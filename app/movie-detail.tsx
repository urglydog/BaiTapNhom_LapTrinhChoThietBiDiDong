import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Alert,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { fetchFavourites, toggleFavourite } from '../src/store/movieSlice';
import { movieService } from '../src/services/movieService';
import { Movie } from '../src/types';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';

const { width } = Dimensions.get('window');

export default function MovieDetailScreen() {
    const { movieId } = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { favourites } = useSelector((state: RootState) => state.movie);
    const { user } = useSelector((state: RootState) => state.auth);
    const { theme } = useSelector((state: RootState) => state.theme);
    const t = useTranslation();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;
    const [movie, setMovie] = useState<Movie | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Kiểm tra xem phim đã được thêm vào yêu thích chưa
    const isFavourite = movie ? favourites.some(fav => fav.movieId === movie.id) : false;

    useEffect(() => {
        const loadMovie = async () => {
            if (!movieId) return;
            try {
                setIsLoading(true);
                const movieData = await movieService.getMovieById(Number(movieId));
                setMovie(movieData);
            } catch (error: any) {
                console.error('Error loading movie:', error);
                Alert.alert(t('Lỗi'), t('Không thể tải thông tin phim'), [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        loadMovie();
    }, [movieId, router]);
    
    // Load favourites khi vào màn hình và khi movie thay đổi
    useFocusEffect(
        React.useCallback(() => {
            if (user) {
                dispatch(fetchFavourites());
            }
        }, [user, dispatch, movieId])
    );
    
    const handleToggleFavourite = async () => {
        if (!movie) return;
        if (!user) {
            Alert.alert(t('Thông báo'), t('Vui lòng đăng nhập để thêm phim vào yêu thích'), [
                { text: t('Đăng nhập'), onPress: () => router.push('/login') },
                { text: t('Hủy'), style: 'cancel' },
            ]);
            return;
        }
        try {
            const result = await dispatch(toggleFavourite(movie.id));
            if (toggleFavourite.fulfilled.match(result)) {
                // Refresh favourites sau khi toggle để đảm bảo sync với server
                await dispatch(fetchFavourites());
                
                // Hiển thị thông báo thành công
                if (result.payload.action === 'add') {
                    Alert.alert(t('Thành công'), t('Đã lưu phim vào yêu thích'));
                } else {
                    Alert.alert(t('Thành công'), t('Đã bỏ yêu thích phim'));
                }
            } else if (toggleFavourite.rejected.match(result)) {
                // Hiển thị lỗi cụ thể từ server
                const errorMessage = result.payload as string || t('Không thể cập nhật yêu thích. Vui lòng thử lại.');
                Alert.alert(t('Lỗi'), errorMessage);
            }
        } catch (error: any) {
            console.error('Toggle favourite error:', error);
            const errorMessage = error?.message || error?.response?.data?.message || t('Không thể cập nhật yêu thích. Vui lòng thử lại.');
            Alert.alert(t('Lỗi'), errorMessage);
        }
    };

    const handleWatchTrailer = () => {
        if (movie?.trailerUrl) {
            Linking.openURL(movie.trailerUrl).catch((err) => {
                console.error('Error opening trailer:', err);
                Alert.alert(t('Lỗi'), t('Không thể mở trailer. Vui lòng kiểm tra URL.'));
            });
        } else {
            Alert.alert(t('Thông báo'), t('Phim này chưa có trailer'));
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: currentTheme.background }]}>
                <ActivityIndicator size="large" color={currentTheme.primary} />
                <Text style={[styles.loadingText, { color: currentTheme.subtext }]}>{t('Đang tải thông tin phim...')}</Text>
            </View>
        );
    }

    if (!movie) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: currentTheme.background }]}>
                <Text style={[styles.errorText, { color: currentTheme.subtext }]}>{t('Không tìm thấy phim')}</Text>
                <TouchableOpacity style={[styles.backButton, { backgroundColor: currentTheme.primary }]} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>{t('Quay lại')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]} showsVerticalScrollIndicator={false}>
            {/* Poster */}
            <View style={styles.posterContainer}>
                {movie.posterUrl ? (
                    <Image
                        source={{ uri: movie.posterUrl }}
                        style={styles.poster}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.placeholderPoster, { backgroundColor: currentTheme.background }]}>
                        <Text style={styles.placeholderText}>📽️</Text>
                        <Text style={[styles.placeholderSubtext, { color: currentTheme.subtext }]}>{t('Không có ảnh')}</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
                    <Text style={styles.backIconText}>←</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.favouriteButton, isFavourite && styles.favouriteButtonActive]} 
                    onPress={handleToggleFavourite}
                    activeOpacity={0.8}
                >
                    <Text style={styles.favouriteIcon}>
                        {isFavourite ? '❤️' : '🤍'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={[styles.content, { backgroundColor: currentTheme.card }]}>
                {/* Title and Trailer Button */}
                <View style={styles.titleSection}>
                    <Text style={[styles.title, { color: currentTheme.text }]}>{movie.title}</Text>
                    {movie.trailerUrl && (
                        <TouchableOpacity style={styles.trailerButton} onPress={handleWatchTrailer}>
                            <Text style={styles.trailerButtonText}>▶ {t('Xem Trailer')}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Movie Info */}
                <View style={styles.infoRow}>
                    {movie.rating && (
                        <View style={[styles.infoBadge, { backgroundColor: currentTheme.background }]}>
                            <Text style={[styles.infoBadgeText, { color: currentTheme.text }]}>⭐ {movie.rating.toFixed(1)}</Text>
                        </View>
                    )}
                    {movie.duration && (
                        <View style={[styles.infoBadge, { backgroundColor: currentTheme.background }]}>
                            <Text style={[styles.infoBadgeText, { color: currentTheme.text }]}>⏱️ {movie.duration} {t('phút')}</Text>
                        </View>
                    )}
                    {movie.ageRating && (
                        <View style={[styles.infoBadge, { backgroundColor: currentTheme.background }]}>
                            <Text style={[styles.infoBadgeText, { color: currentTheme.text }]}>{movie.ageRating}</Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{t('Mô tả')}</Text>
                    <Text style={[styles.description, { color: currentTheme.subtext }]}>{movie.description || t('Chưa có mô tả')}</Text>
                </View>

                {/* Details */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{t('Thông tin chi tiết')}</Text>
                    {movie.genre && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: currentTheme.subtext }]}>{t('Thể loại:')}</Text>
                            <Text style={[styles.detailValue, { color: currentTheme.text }]}>{movie.genre}</Text>
                        </View>
                    )}
                    {movie.director && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: currentTheme.subtext }]}>{t('Đạo diễn:')}</Text>
                            <Text style={[styles.detailValue, { color: currentTheme.text }]}>{movie.director}</Text>
                        </View>
                    )}
                    {movie.cast && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: currentTheme.subtext }]}>{t('Diễn viên:')}</Text>
                            <Text style={[styles.detailValue, { color: currentTheme.text }]}>{movie.cast}</Text>
                        </View>
                    )}
                    {movie.language && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: currentTheme.subtext }]}>{t('Ngôn ngữ:')}</Text>
                            <Text style={[styles.detailValue, { color: currentTheme.text }]}>{movie.language}</Text>
                        </View>
                    )}
                    {movie.subtitle && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: currentTheme.subtext }]}>{t('Phụ đề:')}</Text>
                            <Text style={[styles.detailValue, { color: currentTheme.text }]}>{movie.subtitle}</Text>
                        </View>
                    )}
                    {movie.releaseDate && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: currentTheme.subtext }]}>{t('Ngày khởi chiếu:')}</Text>
                            <Text style={[styles.detailValue, { color: currentTheme.text }]}>
                                {new Date(movie.releaseDate).toLocaleDateString(t('vi-VN'))}
                            </Text>
                        </View>
                    )}
                    {movie.endDate && (
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: currentTheme.subtext }]}>{t('Ngày kết thúc:')}</Text>
                            <Text style={[styles.detailValue, { color: currentTheme.text }]}>
                                {new Date(movie.endDate).toLocaleDateString(t('vi-VN'))}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Buy Ticket Button */}
                <TouchableOpacity
                    style={[styles.buyTicketButton, { backgroundColor: currentTheme.accent }]}
                    onPress={() => router.push({
                        pathname: '/cinema-selection',
                        params: {
                            movieId: movie.id.toString(),
                            movieTitle: movie.title,
                        }
                    })}
                >
                    <Text style={styles.buyTicketButtonText}>{t('Mua vé')}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorText: {
        fontSize: 18,
        marginBottom: 16,
    },
    backButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    posterContainer: {
        width: '100%',
        height: width * 0.75,
        position: 'relative',
    },
    poster: {
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
        fontSize: 64,
        marginBottom: 8,
    },
    placeholderSubtext: {
        fontSize: 16,
    },
    backIcon: {
        position: 'absolute',
        top: 50,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIconText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    favouriteButton: {
        position: 'absolute',
        top: 50,
        right: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    favouriteButtonActive: {
        backgroundColor: 'rgba(255, 0, 0, 0.7)',
    },
    favouriteIcon: {
        fontSize: 28,
    },
    content: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        padding: 20,
    },
    titleSection: {
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    trailerButton: {
        backgroundColor: '#FF0000',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    trailerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
        gap: 8,
    },
    infoBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    infoBadgeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '500',
        width: 120,
    },
    detailValue: {
        fontSize: 16,
        flex: 1,
    },
    buyTicketButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buyTicketButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
