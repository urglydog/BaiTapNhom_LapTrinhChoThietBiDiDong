import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cinemaService } from '../src/services/cinemaService';
import { showtimeService } from '../src/services/showtimeService';
import api from '../src/services/api';
import { Cinema } from '../src/types';

export default function CinemaSelectionScreen() {
    const { movieId, movieTitle } = useLocalSearchParams();
    const router = useRouter();
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [loading, setLoading] = useState(true);
    const [cinemasWithShowtimes, setCinemasWithShowtimes] = useState<Set<number>>(new Set());

    useEffect(() => {
        loadCinemas();
    }, [movieId]);

    const loadCinemas = async () => {
        if (!movieId) return;

        try {
            setLoading(true);
            console.log('🎬 Loading cinemas for movie:', movieId);

            // Lấy tất cả showtimes của phim
            const allShowtimes = await showtimeService.getShowtimesByMovie(Number(movieId));
            console.log('📋 Showtimes found:', allShowtimes.length);

            if (allShowtimes.length === 0) {
                setCinemas([]);
                Alert.alert(
                    'Thông báo',
                    'Hiện tại không có lịch chiếu cho phim này',
                    [
                        { text: 'OK', onPress: () => router.back() }
                    ]
                );
                return;
            }

            // Log để debug
            console.log('📋 First showtime:', JSON.stringify(allShowtimes[0], null, 2));

            // Lấy tất cả cinema hall IDs từ showtimes
            // Vì cinemaHall có @JsonBackReference, cần fetch từ detail hoặc dùng mapping
            const cinemaHallIds: number[] = [];

            // Thử lấy từ showtime detail (chỉ lấy 1-2 cái để xác định pattern)
            const sampleSize = Math.min(3, allShowtimes.length);
            const sampleShowtimes = allShowtimes.slice(0, sampleSize);

            for (const st of sampleShowtimes) {
                try {
                    const detailResponse = await api.get(`/showtimes/${st.id}`);
                    const detail = detailResponse.data.result;
                    if (detail && detail.cinemaHall && detail.cinemaHall.id) {
                        if (!cinemaHallIds.includes(detail.cinemaHall.id)) {
                            cinemaHallIds.push(detail.cinemaHall.id);
                        }
                    }
                } catch (e) {
                    console.log(`Could not fetch detail for showtime ${st.id}`);
                }
            }

            // Nếu vẫn không có, thử lấy từ field trực tiếp
            if (cinemaHallIds.length === 0) {
                for (const st of allShowtimes) {
                    const stAny = st as any;
                    let hallId: number | null = null;

                    if (stAny.cinemaHallId) {
                        hallId = stAny.cinemaHallId;
                    } else if (stAny.cinemaHall && typeof stAny.cinemaHall === 'object' && stAny.cinemaHall.id) {
                        hallId = stAny.cinemaHall.id;
                    } else if (stAny.cinemaHall && typeof stAny.cinemaHall === 'number') {
                        hallId = stAny.cinemaHall;
                    } else if (stAny.cinema_hall_id) {
                        hallId = stAny.cinema_hall_id;
                    }

                    if (hallId && !cinemaHallIds.includes(hallId)) {
                        cinemaHallIds.push(hallId);
                    }
                }
            }

            console.log('🏛️ Cinema hall IDs:', cinemaHallIds);

            // Lấy tất cả cinemas
            const allCinemas = await cinemaService.getAllCinemas();
            console.log('🏢 All cinemas:', allCinemas.length);

            // Mapping mặc định: Cinema halls -> Cinemas
            // Dựa trên data.sql: 
            // Cinema 1 (CGV): halls 1, 2, 3
            // Cinema 2 (Lotte): halls 4, 5
            // Cinema 3 (Galaxy): halls 6, 7
            // Cinema 4 (BHD): hall 8
            const hallToCinemaMap: { [key: number]: number } = {
                1: 1, 2: 1, 3: 1,
                4: 2, 5: 2,
                6: 3, 7: 3,
                8: 4,
            };

            // Thử lấy cinema info từ showtimes nếu có (từ API với JOIN FETCH)
            for (const showtime of allShowtimes) {
                const st = showtime as any;
                if (st.cinemaHall) {
                    // Ưu tiên lấy từ cinemaId (từ getter)
                    if (st.cinemaHall.cinemaId) {
                        hallToCinemaMap[showtime.cinemaHallId] = st.cinemaHall.cinemaId;
                    } 
                    // Hoặc từ cinema object
                    else if (st.cinemaHall.cinema && st.cinemaHall.cinema.id) {
                        hallToCinemaMap[showtime.cinemaHallId] = st.cinemaHall.cinema.id;
                    }
                }
            }

            // Tìm cinemas có showtimes
            const cinemasWithShowtimesSet = new Set<number>();
            cinemaHallIds.forEach(hallId => {
                const cinemaId = hallToCinemaMap[hallId];
                if (cinemaId) {
                    cinemasWithShowtimesSet.add(cinemaId);
                    console.log(`✅ Hall ${hallId} -> Cinema ${cinemaId}`);
                } else {
                    console.warn(`⚠️ No mapping for hall ${hallId}`);
                }
            });

            console.log('✅ Cinemas with showtimes:', Array.from(cinemasWithShowtimesSet));

            setCinemasWithShowtimes(cinemasWithShowtimesSet);
            // Chỉ hiển thị rạp có showtime
            const availableCinemas = allCinemas.filter(c => cinemasWithShowtimesSet.has(c.id));
            setCinemas(availableCinemas);

            if (availableCinemas.length === 0) {
                Alert.alert(
                    'Thông báo',
                    'Hiện tại không có rạp nào có lịch chiếu cho phim này',
                    [
                        { text: 'OK', onPress: () => router.back() }
                    ]
                );
            }
        } catch (error: any) {
            console.error('Error loading cinemas:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách rạp', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCinemaSelect = (cinema: Cinema) => {
        router.push({
            pathname: '/showtime-selection',
            params: {
                movieId: movieId as string,
                cinemaId: cinema.id.toString(),
                cinemaName: cinema.name,
            }
        });
    };

    const renderCinema = ({ item }: { item: Cinema }) => {
        const hasShowtimes = cinemasWithShowtimes.has(item.id);

        return (
            <TouchableOpacity
                style={[
                    styles.cinemaCard,
                    !hasShowtimes && styles.cinemaCardDisabled
                ]}
                onPress={() => hasShowtimes && handleCinemaSelect(item)}
                disabled={!hasShowtimes}
                activeOpacity={0.7}
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
                            <Ionicons name="film-outline" size={40} color="#999" />
                        </View>
                    )}
                </View>
                <View style={styles.cinemaInfo}>
                    <Text style={styles.cinemaName}>{item.name}</Text>
                    {item.address && (
                        <View style={styles.addressRow}>
                            <Ionicons name="location-outline" size={16} color="#666" />
                            <Text style={styles.cinemaAddress} numberOfLines={2}>
                                {item.address}
                            </Text>
                        </View>
                    )}
                    {item.city && (
                        <View style={styles.cityRow}>
                            <Ionicons name="business-outline" size={16} color="#666" />
                            <Text style={styles.cinemaCity}>{item.city}</Text>
                        </View>
                    )}
                    {item.phone && (
                        <View style={styles.phoneRow}>
                            <Ionicons name="call-outline" size={16} color="#666" />
                            <Text style={styles.cinemaPhone}>{item.phone}</Text>
                        </View>
                    )}
                </View>
                {hasShowtimes && (
                    <View style={styles.selectIndicator}>
                        <Ionicons name="chevron-forward" size={24} color="#E91E63" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#E91E63" />
                <Text style={styles.loadingText}>Đang tải danh sách rạp...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Chọn rạp chiếu</Text>
                    {movieTitle && (
                        <Text style={styles.headerSubtitle} numberOfLines={1}>
                            {movieTitle}
                        </Text>
                    )}
                </View>
            </View>

            <FlatList
                data={cinemas}
                renderItem={renderCinema}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="film-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>
                            Không có rạp nào có lịch chiếu cho phim này
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
        backgroundColor: '#fff',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: 50,
    },
    backButton: {
        marginRight: 16,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    listContainer: {
        padding: 16,
    },
    cinemaCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#eee',
    },
    cinemaCardDisabled: {
        opacity: 0.5,
    },
    cinemaImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 16,
        backgroundColor: '#f5f5f5',
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
        backgroundColor: '#f5f5f5',
    },
    cinemaInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    cinemaName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    cinemaAddress: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
        flex: 1,
    },
    cityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    cinemaCity: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cinemaPhone: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    selectIndicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
        textAlign: 'center',
    },
});

