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

const { width } = Dimensions.get('window');

export default function MovieDetailScreen() {
    const { movieId } = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { favourites } = useSelector((state: RootState) => state.movie);
    const { user } = useSelector((state: RootState) => state.auth);
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
                Alert.alert('Lỗi', 'Không thể tải thông tin phim', [
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
            Alert.alert('Thông báo', 'Vui lòng đăng nhập để thêm phim vào yêu thích', [
                { text: 'Đăng nhập', onPress: () => router.push('/login') },
                { text: 'Hủy', style: 'cancel' },
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
                const errorMessage = result.payload as string || 'Không thể cập nhật yêu thích. Vui lòng thử lại.';
                Alert.alert('Lỗi', errorMessage);
            }
        } catch (error: any) {
            console.error('Toggle favourite error:', error);
            const errorMessage = error?.message || error?.response?.data?.message || 'Không thể cập nhật yêu thích. Vui lòng thử lại.';
            Alert.alert('Lỗi', errorMessage);
        }
    };

    const handleWatchTrailer = () => {
        if (movie?.trailerUrl) {
            Linking.openURL(movie.trailerUrl).catch((err) => {
                console.error('Error opening trailer:', err);
                Alert.alert('Lỗi', 'Không thể mở trailer. Vui lòng kiểm tra URL.');
            });
        } else {
            Alert.alert('Thông báo', 'Phim này chưa có trailer');
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Đang tải thông tin phim...</Text>
            </View>
        );
    }

    if (!movie) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Không tìm thấy phim</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Poster */}
            <View style={styles.posterContainer}>
                {movie.posterUrl ? (
                    <Image
                        source={{ uri: movie.posterUrl }}
                        style={styles.poster}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderPoster}>
                        <Text style={styles.placeholderText}>📽️</Text>
                        <Text style={styles.placeholderSubtext}>Không có ảnh</Text>
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
            <View style={styles.content}>
                {/* Title and Trailer Button */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{movie.title}</Text>
                    {movie.trailerUrl && (
                        <TouchableOpacity style={styles.trailerButton} onPress={handleWatchTrailer}>
                            <Text style={styles.trailerButtonText}>▶ Xem Trailer</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Movie Info */}
                <View style={styles.infoRow}>
                    {movie.rating && (
                        <View style={styles.infoBadge}>
                            <Text style={styles.infoBadgeText}>⭐ {movie.rating.toFixed(1)}</Text>
                        </View>
                    )}
                    {movie.duration && (
                        <View style={styles.infoBadge}>
                            <Text style={styles.infoBadgeText}>⏱️ {movie.duration} phút</Text>
                        </View>
                    )}
                    {movie.ageRating && (
                        <View style={styles.infoBadge}>
                            <Text style={styles.infoBadgeText}>{movie.ageRating}</Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Mô tả</Text>
                    <Text style={styles.description}>{movie.description || 'Chưa có mô tả'}</Text>
                </View>

                {/* Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
                    {movie.genre && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Thể loại:</Text>
                            <Text style={styles.detailValue}>{movie.genre}</Text>
                        </View>
                    )}
                    {movie.director && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Đạo diễn:</Text>
                            <Text style={styles.detailValue}>{movie.director}</Text>
                        </View>
                    )}
                    {movie.cast && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Diễn viên:</Text>
                            <Text style={styles.detailValue}>{movie.cast}</Text>
                        </View>
                    )}
                    {movie.language && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Ngôn ngữ:</Text>
                            <Text style={styles.detailValue}>{movie.language}</Text>
                        </View>
                    )}
                    {movie.subtitle && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Phụ đề:</Text>
                            <Text style={styles.detailValue}>{movie.subtitle}</Text>
                        </View>
                    )}
                    {movie.releaseDate && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Ngày khởi chiếu:</Text>
                            <Text style={styles.detailValue}>
                                {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                            </Text>
                        </View>
                    )}
                    {movie.endDate && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Ngày kết thúc:</Text>
                            <Text style={styles.detailValue}>
                                {new Date(movie.endDate).toLocaleDateString('vi-VN')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Buy Ticket Button */}
                <TouchableOpacity
                    style={styles.buyTicketButton}
                    onPress={() => router.push({
                        pathname: '/cinema-selection',
                        params: {
                            movieId: movie.id.toString(),
                            movieTitle: movie.title,
                        }
                    })}
                >
                    <Text style={styles.buyTicketButtonText}>Mua vé</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
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
    errorText: {
        fontSize: 18,
        color: '#999',
        marginBottom: 16,
    },
    backButton: {
        backgroundColor: '#007AFF',
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
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 64,
        marginBottom: 8,
    },
    placeholderSubtext: {
        fontSize: 16,
        color: '#999',
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
        backgroundColor: '#fff',
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
        color: '#333',
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
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    infoBadgeText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    detailLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
        width: 120,
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    buyTicketButton: {
        backgroundColor: '#E91E63',
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
