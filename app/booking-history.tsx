import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { fetchUserBookings } from '../src/store/bookingSlice';
import { Booking } from '../src/types';
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';

export default function BookingHistoryScreen() {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return '#4CAF50';
            case 'PENDING':
                return '#FF9800';
            case 'CANCELLED':
                return '#F44336';
            default:
                return '#666';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return t('Đã xác nhận');
            case 'PENDING':
                return t('Đang chờ');
            case 'CANCELLED':
                return t('Đã hủy');
            default:
                return status;
        }
    };

    const renderBooking = ({ item }: { item: Booking }) => {
        const movie = item.showtime?.movie;
        const showtime = item.showtime;

        return (
            <TouchableOpacity
                style={[styles.bookingCard, { backgroundColor: currentTheme.card }]}
                onPress={() => {
                    // Có thể mở chi tiết booking sau
                    Alert.alert(
                        t('Chi tiết đặt vé'),
                        `${t('Mã đặt vé')}: ${item.id}\n${t('Tổng tiền')}: ${item.totalAmount.toLocaleString()} ${t('VNĐ')}\n${t('Trạng thái')}: ${getStatusText(item.status)}`
                    );
                }}
            >
                <View style={styles.bookingHeader}>
                    <View style={styles.bookingInfo}>
                        <Text style={[styles.movieTitle, { color: currentTheme.text }]}>
                            {movie?.title || t('Phim')}
                        </Text>
                        <Text style={[styles.bookingCode, { color: currentTheme.subtext }]}>
                            {t('Mã đặt vé')}: #{item.id}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                    </View>
                </View>

                {showtime && (
                    <View style={styles.showtimeInfo}>
                        {showtime.showDate && (
                            <Text style={[styles.showtimeText, { color: currentTheme.subtext }]}>
                                📅 {new Date(showtime.showDate).toLocaleDateString('vi-VN')}
                            </Text>
                        )}
                        {showtime.startTime && (
                            <Text style={[styles.showtimeText, { color: currentTheme.subtext }]}>
                                🕐 {showtime.startTime.substring(0, 5)}
                            </Text>
                        )}
                        {showtime.cinemaHall?.cinema?.name && (
                            <Text style={[styles.showtimeText, { color: currentTheme.subtext }]}>
                                🎭 {showtime.cinemaHall.cinema.name}
                            </Text>
                        )}
                        {showtime.cinemaHall?.name && (
                            <Text style={[styles.showtimeText, { color: currentTheme.subtext }]}>
                                🎪 {showtime.cinemaHall.name}
                            </Text>
                        )}
                    </View>
                )}

                {item.seats && item.seats.length > 0 && (
                    <View style={styles.seatsInfo}>
                        <Text style={[styles.seatsLabel, { color: currentTheme.subtext }]}>
                            {t('Ghế đã đặt')}:
                        </Text>
                        <Text style={[styles.seatsText, { color: currentTheme.text }]}>
                            {item.seats.map(s => s.seatNumber || `${s.seatRow}${s.seatNumber}`).join(', ')}
                        </Text>
                    </View>
                )}

                <View style={styles.bookingFooter}>
                    <Text style={[styles.amountLabel, { color: currentTheme.subtext }]}>
                        {t('Tổng tiền')}:
                    </Text>
                    <Text style={[styles.amountValue, { color: currentTheme.primary }]}>
                        {item.totalAmount.toLocaleString()} {t('VNĐ')}
                    </Text>
                </View>

                {item.bookingDate && (
                    <Text style={[styles.bookingDate, { color: currentTheme.subtext }]}>
                        {t('Ngày đặt')}: {new Date(item.bookingDate).toLocaleString('vi-VN')}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    if (!user) {
        return (
            <View style={[styles.container, styles.centerContainer, { backgroundColor: currentTheme.background }]}>
                <Text style={[styles.emptyText, { color: currentTheme.subtext }]}>
                    {t('Vui lòng đăng nhập để xem lịch sử đặt vé')}
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

    if (isLoading && bookings.length === 0) {
        return (
            <View style={[styles.container, styles.centerContainer, { backgroundColor: currentTheme.background }]}>
                <ActivityIndicator size="large" color={currentTheme.primary} />
                <Text style={[styles.loadingText, { color: currentTheme.subtext }]}>
                    {t('Đang tải lịch sử đặt vé...')}
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
                    {t('Lịch sử đặt vé')}
                </Text>
                <Text style={[styles.headerSubtitle, { color: currentTheme.subtext }]}>
                    {bookings.length} {t('đặt vé')}
                </Text>
            </View>

            <FlatList
                data={bookings}
                renderItem={renderBooking}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🎫</Text>
                        <Text style={[styles.emptyText, { color: currentTheme.text }]}>
                            {t('Bạn chưa có đặt vé nào')}
                        </Text>
                        <Text style={[styles.emptySubtext, { color: currentTheme.subtext }]}>
                            {t('Hãy đặt vé để xem phim nhé!')}
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
    bookingCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    bookingInfo: {
        flex: 1,
        marginRight: 12,
    },
    movieTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bookingCode: {
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    showtimeInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 8,
    },
    showtimeText: {
        fontSize: 14,
        marginRight: 12,
    },
    seatsInfo: {
        flexDirection: 'row',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    seatsLabel: {
        fontSize: 14,
        marginRight: 8,
    },
    seatsText: {
        fontSize: 14,
        fontWeight: '500',
    },
    bookingFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    amountLabel: {
        fontSize: 14,
    },
    amountValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    bookingDate: {
        fontSize: 12,
        marginTop: 4,
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

