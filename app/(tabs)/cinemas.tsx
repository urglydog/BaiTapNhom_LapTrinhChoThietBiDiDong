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
import { RootState, AppDispatch } from '../../src/store';
import { fetchCinemas } from '../../src/store/movieSlice';
import { Cinema, Showtime } from '../../src/types';
import { movieService } from '../../src/services/movieService';

export default function CinemasTabScreen() {
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

    const handleBookShowtime = (showtime: Showtime) => {
        router.push(`/booking?showtimeId=${showtime.id}`);
    };

    const renderCinema = ({ item }: { item: Cinema }) => (
        <TouchableOpacity
            style={[
                styles.cinemaCard,
                selectedCinema === item.id && styles.cinemaCardSelected,
            ]}
            onPress={() => handleCinemaPress(item)}
            activeOpacity={0.8}
        >
            <View style={styles.cinemaImageContainer}>
                {item.imageUrl ? (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.cinemaImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderText}>🎭</Text>
                    </View>
                )}
            </View>
            <View style={styles.cinemaInfo}>
                <Text style={styles.cinemaName}>{item.name || 'Rạp chiếu phim'}</Text>
                {item.address && (
                    <Text style={styles.cinemaAddress} numberOfLines={2}>
                        📍 {item.address}
                    </Text>
                )}
                {item.city && (
                    <Text style={styles.cinemaCity}>🏙️ {item.city}</Text>
                )}
                {item.phone && (
                    <Text style={styles.cinemaPhone}>📞 {item.phone}</Text>
                )}
            </View>
            {selectedCinema === item.id && (
                <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderShowtime = ({ item }: { item: Showtime }) => (
        <TouchableOpacity
            style={styles.showtimeCard}
            onPress={() => handleShowtimePress(item)}
            activeOpacity={0.8}
        >
            <View style={styles.showtimeInfo}>
                <Text style={styles.showtimeMovie} numberOfLines={1}>
                    {item.movie?.title || 'Phim'}
                </Text>
                {item.startTime && item.endTime && (
                    <Text style={styles.showtimeTime}>
                        ⏰ {item.startTime} - {item.endTime}
                    </Text>
                )}
                {item.showDate && (
                    <Text style={styles.showtimeDate}>
                        📅 {new Date(item.showDate).toLocaleDateString('vi-VN')}
                    </Text>
                )}
            </View>
            <View style={styles.showtimeActions}>
                {item.price != null && (
                    <Text style={styles.showtimePrice}>
                        {item.price.toLocaleString()} VNĐ
                    </Text>
                )}
                <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookShowtime(item)}
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
                        <Text style={styles.emptyIcon}>🎭</Text>
                        <Text style={styles.emptyText}>Không có rạp chiếu nào</Text>
                    </View>
                }
            />

            {selectedCinema && (
                <View style={styles.showtimesContainer}>
                    <View style={styles.showtimesHeader}>
                        <Text style={styles.showtimesTitle}>Lịch Chiếu</Text>
                        <TouchableOpacity
                            onPress={() => setSelectedCinema(null)}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    {loadingShowtimes ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4f8cff" />
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
    cinemaList: {
        padding: 16,
    },
    cinemaCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    cinemaCardSelected: {
        borderColor: '#4f8cff',
    },
    cinemaImageContainer: {
        width: '100%',
        height: 180,
        backgroundColor: '#e0e0e0',
    },
    cinemaImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
    placeholderText: {
        fontSize: 64,
    },
    cinemaInfo: {
        padding: 16,
    },
    cinemaName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    cinemaAddress: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    cinemaCity: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    cinemaPhone: {
        fontSize: 14,
        color: '#666',
    },
    selectedIndicator: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#4f8cff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedIndicatorText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    showtimesContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '60%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 16,
    },
    showtimesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    showtimesTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: '#666',
        fontWeight: 'bold',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    showtimesList: {
        padding: 16,
    },
    showtimeCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4f8cff',
    },
    showtimeInfo: {
        marginBottom: 12,
    },
    showtimeMovie: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    showtimeTime: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    showtimeDate: {
        fontSize: 14,
        color: '#666',
    },
    showtimeActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    showtimePrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4f8cff',
    },
    bookButton: {
        backgroundColor: '#4f8cff',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    bookButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
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

