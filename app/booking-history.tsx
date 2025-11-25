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
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { fetchUserBookings } from '../src/store/bookingSlice';
import { Booking } from '../src/types';
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';
import { pdfService } from '../src/services/pdfService';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

type PaymentFilter = 'ALL' | 'CASH' | 'BANK_TRANSFER' | 'VNPAY' | 'CREDIT_CARD';

export default function BookingHistoryScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('ALL');
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

    const getPaymentMethodText = (method?: string) => {
        switch (method) {
            case 'CASH':
                return t('Tiền mặt');
            case 'BANK_TRANSFER':
                return t('Chuyển khoản');
            case 'VNPAY':
                return 'VNPay';
            case 'CREDIT_CARD':
                return t('Thẻ tín dụng');
            default:
                return t('Chưa xác định');
        }
    };

    // Filter bookings by payment method
    const filteredBookings = bookings.filter(booking => {
        if (paymentFilter === 'ALL') return true;
        return booking.paymentMethod === paymentFilter;
    });

    const paymentFilters: { key: PaymentFilter; label: string }[] = [
        { key: 'ALL', label: t('Tất cả') },
        { key: 'VNPAY', label: 'VNPay' },
        { key: 'CASH', label: t('Tiền mặt') },
        { key: 'BANK_TRANSFER', label: t('Chuyển khoản') },
    ];

    const handleExportPDF = async (booking: Booking) => {
        try {
            const pdfUri = await pdfService.generateTicketPDF(booking);
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(pdfUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: t('Xuất vé PDF'),
                });
            } else {
                Alert.alert(
                    t('Thành công'),
                    t('PDF đã được tạo')
                );
            }
        } catch (error: any) {
            console.error('Error exporting PDF:', error);
            Alert.alert(t('Lỗi'), t('Không thể xuất PDF'));
        }
    };

    const renderBooking = ({ item }: { item: Booking }) => {
        const movie = item.showtime?.movie;
        const showtime = item.showtime;

        return (
            <TouchableOpacity
                style={[styles.bookingCard, { backgroundColor: currentTheme.card }]}
                onPress={() => {
                    router.push({
                        pathname: '/ticket-detail',
                        params: { bookingId: item.id.toString() }
                    } as any);
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

                {(() => {
                    // Hỗ trợ cả seats và bookingItems
                    const seats = item.seats || (item.bookingItems?.map((bi: any) => ({
                        seat: bi.seat,
                        seatNumber: bi.seat?.seatNumber,
                        seatRow: bi.seat?.seatRow,
                    })) || []);
                    
                    if (seats && seats.length > 0) {
                        const seatNumbers = seats.map((s: any) => {
                            if (s.seat?.seatNumber) return s.seat.seatNumber;
                            if (s.seatNumber) return s.seatNumber;
                            if (s.seat?.seatRow && s.seat?.seatNumber) return `${s.seat.seatRow}${s.seat.seatNumber}`;
                            if (s.seatRow && s.seatNumber) return `${s.seatRow}${s.seatNumber}`;
                            return null;
                        }).filter(Boolean);
                        
                        if (seatNumbers.length > 0) {
                            return (
                                <View style={styles.seatsInfo}>
                                    <Text style={[styles.seatsLabel, { color: currentTheme.subtext }]}>
                                        {t('Ghế đã đặt')}:
                                    </Text>
                                    <Text style={[styles.seatsText, { color: currentTheme.text }]}>
                                        {seatNumbers.join(', ')}
                                    </Text>
                                </View>
                            );
                        }
                    }
                    return null;
                })()}

                <View style={styles.bookingFooter}>
                    <Text style={[styles.amountLabel, { color: currentTheme.subtext }]}>
                        {t('Tổng tiền')}:
                    </Text>
                    <Text style={[styles.amountValue, { color: currentTheme.primary }]}>
                        {item.totalAmount.toLocaleString()} {t('VNĐ')}
                    </Text>
                </View>

                {item.paymentMethod && (
                    <View style={styles.paymentMethodInfo}>
                        <Text style={[styles.paymentMethodLabel, { color: currentTheme.subtext }]}>
                            {t('Phương thức thanh toán')}:
                        </Text>
                        <Text style={[styles.paymentMethodValue, { color: currentTheme.text }]}>
                            {getPaymentMethodText(item.paymentMethod)}
                        </Text>
                    </View>
                )}

                {item.bookingDate && (
                    <Text style={[styles.bookingDate, { color: currentTheme.subtext }]}>
                        {t('Ngày đặt')}: {new Date(item.bookingDate).toLocaleString('vi-VN')}
                    </Text>
                )}

                <View style={styles.bookingActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: currentTheme.primary + '20' }]}
                        onPress={() => {
                            router.push({
                                pathname: '/ticket-detail',
                                params: { bookingId: item.id.toString() }
                            } as any);
                        }}
                    >
                        <Ionicons name="eye" size={18} color={currentTheme.primary} />
                        <Text style={[styles.actionButtonText, { color: currentTheme.primary }]}>
                            {t('Chi tiết')}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: currentTheme.primary + '20' }]}
                        onPress={() => handleExportPDF(item)}
                    >
                        <Ionicons name="download" size={18} color={currentTheme.primary} />
                        <Text style={[styles.actionButtonText, { color: currentTheme.primary }]}>
                            {t('PDF')}
                        </Text>
                    </TouchableOpacity>
                </View>
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
                    {filteredBookings.length} {t('đặt vé')}
                </Text>
            </View>

            {/* Payment Method Filter Tabs */}
            <View style={[styles.filterContainer, { backgroundColor: currentTheme.card }]}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                >
                    {paymentFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.filterTab,
                                {
                                    backgroundColor: paymentFilter === filter.key 
                                        ? currentTheme.primary 
                                        : currentTheme.background,
                                    borderColor: paymentFilter === filter.key 
                                        ? currentTheme.primary 
                                        : currentTheme.subtext + '40',
                                }
                            ]}
                            onPress={() => setPaymentFilter(filter.key)}
                        >
                            <Text
                                style={[
                                    styles.filterTabText,
                                    {
                                        color: paymentFilter === filter.key 
                                            ? '#fff' 
                                            : currentTheme.text,
                                    }
                                ]}
                            >
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredBookings}
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
    paymentMethodInfo: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
    },
    paymentMethodLabel: {
        fontSize: 12,
    },
    paymentMethodValue: {
        fontSize: 12,
        fontWeight: '600',
    },
    filterContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    filterScrollContent: {
        gap: 8,
        paddingHorizontal: 4,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
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
    bookingActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        gap: 6,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

