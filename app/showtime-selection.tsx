import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { movieService } from '../src/services/movieService';
import { showtimeService } from '../src/services/showtimeService';
import { Movie, ShowtimeWithCinema } from '../src/types';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';

const { width } = Dimensions.get('window');

interface ShowtimesByDate {
    [date: string]: {
        [cinemaId: number]: {
            cinema: any;
            showtimes: ShowtimeWithCinema[];
        };
    };
}

export default function ShowtimeSelectionScreen() {
    const { movieId, cinemaId, cinemaName } = useLocalSearchParams();
    const router = useRouter();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [showtimesByDate, setShowtimesByDate] = useState<ShowtimesByDate>({});
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingDates, setLoadingDates] = useState<Set<string>>(new Set());
    const { theme } = useSelector((state: RootState) => state.theme);
    const t = useTranslation();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    useEffect(() => {
        loadMovieAndShowtimes();
    }, [movieId]);

    const loadMovieAndShowtimes = async () => {
        if (!movieId) return;
        try {
            setIsLoading(true);
            
            // Load movie info
            const movieData = await movieService.getMovieById(Number(movieId));
            setMovie(movieData);

            // Get all showtimes for this movie
            let allShowtimes = await showtimeService.getShowtimesByMovie(Number(movieId));
            
            // Nếu có cinemaId, filter theo rạp đã chọn
            if (cinemaId) {
                const cinemaShowtimes = await showtimeService.getShowtimesByMovieAndCinema(
                    Number(movieId),
                    Number(cinemaId)
                );
                allShowtimes = cinemaShowtimes;
            }
            
            // Extract unique dates from showtimes (lấy tất cả các ngày có showtime)
            const uniqueDates = Array.from(
                new Set(
                    allShowtimes
                        .map(st => st.showDate)
                        .filter(date => date != null)
                        .sort() // Sort dates
                )
            ) as string[];
            
            // Nếu không có showtime nào, tạo 7 ngày từ hôm nay
            let dates: string[] = [];
            if (uniqueDates.length > 0) {
                dates = uniqueDates;
            } else {
                const today = new Date();
                for (let i = 0; i < 7; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() + i);
                    dates.push(date.toISOString().split('T')[0]);
                }
            }
            
            setAvailableDates(dates);
            if (dates.length > 0) {
                setSelectedDate(dates[0]);
                // Load showtimes for the first date
                await loadShowtimesForDate(dates[0]);
            }
        } catch (error: any) {
            console.error('Error loading data:', error);
            Alert.alert(t('Lỗi'), t('Không thể tải thông tin phim'), [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadShowtimesForDate = async (date: string) => {
        if (!movieId) return;
        
        // Nếu đã có dữ liệu cho ngày này, không load lại
        if (showtimesByDate[date]) {
            return;
        }
        
        try {
            setLoadingDates(prev => new Set(prev).add(date));
            console.log('🔄 Loading showtimes for date:', date);
            
            let showtimes = await showtimeService.getShowtimesByMovieAndDate(
                Number(movieId),
                date
            );
            
            // Nếu có cinemaId, filter theo rạp đã chọn
            if (cinemaId) {
                showtimes = showtimes.filter(st => {
                    // Kiểm tra xem showtime này thuộc rạp đã chọn không
                    return st.cinema?.id === Number(cinemaId);
                });
            }

            console.log('📦 Received showtimes:', showtimes.length);

            // Group by cinema
            const grouped: ShowtimesByDate[string] = {};
            showtimes.forEach((showtime) => {
                console.log('Processing showtime:', showtime);
                if (showtime.cinema) {
                    const cinemaId = showtime.cinema.id;
                    if (!grouped[cinemaId]) {
                        grouped[cinemaId] = {
                            cinema: showtime.cinema,
                            showtimes: [],
                        };
                    }
                    grouped[cinemaId].showtimes.push(showtime);
                } else {
                    console.warn('⚠️ Showtime without cinema:', showtime);
                }
            });

            console.log('🎯 Grouped showtimes:', Object.keys(grouped).length, 'cinemas');

            setShowtimesByDate((prev) => ({
                ...prev,
                [date]: grouped,
            }));
        } catch (error: any) {
            console.error('❌ Error loading showtimes for date:', error);
            Alert.alert(
                t('Lỗi'), 
                error.message || t('Không thể tải lịch chiếu cho ngày này'),
                [
                    { text: t('Thử lại'), onPress: () => loadShowtimesForDate(date) },
                    { text: 'OK', style: 'cancel' }
                ]
            );
        } finally {
            setLoadingDates(prev => {
                const newSet = new Set(prev);
                newSet.delete(date);
                return newSet;
            });
        }
    };

    const handleDateSelect = async (date: string) => {
        setSelectedDate(date);
        if (!showtimesByDate[date]) {
            await loadShowtimesForDate(date);
        }
    };

    const handleShowtimeSelect = async (showtime: ShowtimeWithCinema) => {
        try {
            // Load showtime details để lấy đầy đủ thông tin (bao gồm cinemaHall)
            const showtimeDetails = await showtimeService.getShowtimeById(showtime.id);
            
            // Load cinema hall nếu cần để lấy thông tin cinema
            let finalCinemaName = showtime.cinema?.name || t('Cinema');
            let finalHallName = showtime.cinemaHall?.hallName || showtimeDetails.cinemaHall?.hallName || 'Phòng chiếu';
            
            // Nếu chưa có cinema name, thử load từ cinema hall
            if (!showtime.cinema && showtimeDetails.cinemaHall) {
                try {
                    const { cinemaService } = await import('../src/services/cinemaService');
                    const hallInfo = await cinemaService.getCinemaHallById(showtimeDetails.cinemaHallId);
                    // CinemaHall có thể có cinema info hoặc cần load riêng
                    // Tạm thời dùng fallback
                } catch (e) {
                    console.error('Error loading cinema hall:', e);
                }
            }
            
            // Lấy thông tin từ showtime hoặc showtimeDetails
            const movieTitle = movie?.title || showtimeDetails.movie?.title || 'Phim';
            const showDate = showtime.showDate || showtimeDetails.showDate;
            const showTime = showtime.startTime || showtimeDetails.startTime;
            const price = showtime.price || showtimeDetails.price || 0;

            router.push({
                pathname: '/seat-selection',
                params: {
                    showtimeId: showtime.id.toString(),
                    movieTitle,
                    cinemaName: finalCinemaName,
                    hallName: finalHallName,
                    showDate,
                    showTime,
                    price: price.toString(),
                },
            });
        } catch (error: any) {
            console.error('Error loading showtime details:', error);
            // Fallback: truyền thông tin có sẵn
            router.push({
                pathname: '/seat-selection',
                params: {
                    showtimeId: showtime.id.toString(),
                    movieTitle: movie?.title || 'Phim',
                    cinemaName: showtime.cinema?.name || t('Cinema'),
                    hallName: showtime.cinemaHall?.hallName || 'Phòng chiếu',
                    showDate: showtime.showDate,
                    showTime: showtime.startTime,
                    price: (showtime.price || 0).toString(),
                },
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t('H.nay');
        if (diffDays === 1) return t('Thứ {day}', { day: date.getDay() === 0 ? 'CN' : date.getDay() + 1 });
        
        const dayNames = ['CN', '2', '3', '4', '5', '6', '7'];
        return t('Thứ {day}', { day: dayNames[date.getDay()] });
    };

    const formatDateFull = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5); // HH:mm
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    if (isLoading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: currentTheme.background }]}>
                <ActivityIndicator size="large" color={currentTheme.accent} />
                <Text style={[styles.loadingText, { color: currentTheme.subtext }]}>{t('Đang tải lịch chiếu...')}</Text>
            </View>
        );
    }

    if (!movie) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: currentTheme.background }]}>
                <Text style={[styles.errorText, { color: currentTheme.subtext }]}>{t('Không tìm thấy phim')}</Text>
                <TouchableOpacity style={[styles.backButton, { backgroundColor: currentTheme.accent }]} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>{t('Quay lại')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.background }]}>
                <TouchableOpacity style={[styles.backIcon, { backgroundColor: currentTheme.background }]} onPress={() => router.back()}>
                    <Text style={[styles.backIconText, { color: currentTheme.text }]}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={[styles.headerTitle, { color: currentTheme.text }]} numberOfLines={1}>
                        {movie.title}
                    </Text>
                    {cinemaName && (
                        <Text style={[styles.headerCinema, { color: currentTheme.accent }]} numberOfLines={1}>
                            🎭 {cinemaName}
                        </Text>
                    )}
                </View>
            </View>

            {/* Date Selector */}
            <View style={[styles.dateSelector, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.background }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {availableDates.map((date) => (
                        <TouchableOpacity
                            key={date}
                            style={[
                                styles.dateButton,
                                { backgroundColor: currentTheme.background },
                                selectedDate === date && [styles.dateButtonSelected, { backgroundColor: currentTheme.accent }],
                            ]}
                            onPress={() => handleDateSelect(date)}
                        >
                            <Text
                                style={[
                                    styles.dateFull,
                                    { color: currentTheme.text },
                                    selectedDate === date && styles.dateTextSelected,
                                ]}
                            >
                                {formatDateFull(date)}
                            </Text>
                            <Text
                                style={[
                                    styles.dateDay,
                                    { color: currentTheme.subtext },
                                    selectedDate === date && styles.dateTextSelected,
                                ]}
                            >
                                {formatDate(date)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Showtimes by Cinema */}
            <ScrollView style={styles.showtimesList} showsVerticalScrollIndicator={false}>
                {loadingDates.has(selectedDate) ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={currentTheme.accent} />
                        <Text style={[styles.loadingText, { color: currentTheme.subtext }]}>{t('Đang tải lịch chiếu...')}</Text>
                    </View>
                ) : selectedDate && showtimesByDate[selectedDate] ? (
                    Object.values(showtimesByDate[selectedDate]).map((cinemaData: any) => (
                        <View key={cinemaData.cinema.id} style={[styles.cinemaSection, { backgroundColor: currentTheme.card }]}>
                            <View style={[styles.cinemaHeader, { borderBottomColor: currentTheme.background }]}>
                                <Text style={[styles.cinemaName, { color: currentTheme.text }]}>{cinemaData.cinema.name}</Text>
                                <Text style={[styles.cinemaAddress, { color: currentTheme.subtext }]}>
                                    {cinemaData.cinema.address}
                                </Text>
                            </View>

                            <View style={styles.showtimesGrid}>
                                <Text style={[styles.format2D, { color: currentTheme.accent }]}>2D Phụ đề</Text>
                                <View style={styles.timeButtonsContainer}>
                                    {cinemaData.showtimes.length > 0 ? (
                                        cinemaData.showtimes.map((showtime: ShowtimeWithCinema) => (
                                            <TouchableOpacity
                                                key={showtime.id}
                                                style={[styles.timeButton, { borderColor: currentTheme.accent, backgroundColor: currentTheme.card }]}
                                                onPress={() => handleShowtimeSelect(showtime)}
                                            >
                                                <Text style={[styles.timeText, { color: currentTheme.accent }]}>
                                                    {formatTime(showtime.startTime)}
                                                </Text>
                                                <Text style={[styles.endTimeText, { color: currentTheme.subtext }]}>
                                                    ~{formatTime(showtime.endTime)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <Text style={[styles.emptyText, { color: currentTheme.subtext }]}>{t('Chưa có suất chiếu')}</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: currentTheme.subtext }]}>{t('Chưa có lịch chiếu cho ngày này')}</Text>
                        <TouchableOpacity 
                            style={[styles.retryButton, { backgroundColor: currentTheme.accent }]}
                            onPress={() => selectedDate && loadShowtimesForDate(selectedDate)}
                        >
                            <Text style={styles.retryButtonText}>{t('Thử lại')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    backIconText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    headerCinema: {
        fontSize: 13,
        marginTop: 2,
        fontWeight: '600',
    },
    dateSelector: {
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    dateButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginHorizontal: 6,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 70,
    },
    dateButtonSelected: {},
    dateFull: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    dateDay: {
        fontSize: 14,
    },
    dateTextSelected: {
        color: '#fff',
    },
    showtimesList: {
        flex: 1,
    },
    cinemaSection: {
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cinemaHeader: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    cinemaName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cinemaAddress: {
        fontSize: 14,
    },
    showtimesGrid: {
        marginTop: 8,
    },
    format2D: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    timeButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    timeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 90,
        alignItems: 'center',
    },
    timeText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    endTimeText: {
        fontSize: 12,
        marginTop: 2,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});