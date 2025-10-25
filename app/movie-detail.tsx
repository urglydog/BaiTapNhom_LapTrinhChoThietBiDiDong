import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { fetchMovieById, fetchShowtimes, fetchReviews, toggleFavourite } from '../src/store/movieSlice';
import { Showtime } from '../src/types';

export default function MovieDetailScreen() {
    const { movieId } = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const { currentMovie, showtimes, reviews, favourites } = useSelector((state: RootState) => state.movie);

    useEffect(() => {
        if (movieId) {
            dispatch(fetchMovieById(Number(movieId)));
            dispatch(fetchShowtimes(Number(movieId)));
            dispatch(fetchReviews(Number(movieId)));
        }
    }, [dispatch, movieId]);

    const isFavourite = favourites.some((fav: any) => fav.movieId === Number(movieId));

    const handleToggleFavourite = () => {
        if (movieId) {
            dispatch(toggleFavourite(Number(movieId)));
        }
    };

    const handleBookTicket = (showtime: Showtime) => {
        router.push(`/booking?showtimeId=${showtime.id}` as any);
    };

    if (!currentMovie) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{currentMovie.title}</Text>
                <TouchableOpacity onPress={handleToggleFavourite} style={styles.favouriteButton}>
                    <Text style={styles.favouriteText}>
                        {isFavourite ? '❤️' : '🤍'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.movieInfo}>
                <Text style={styles.genre}>{currentMovie.genre}</Text>
                <Text style={styles.duration}>{currentMovie.duration} phút</Text>
                <Text style={styles.rating}>⭐ {currentMovie.rating}</Text>
                <Text style={styles.ageRating}>{currentMovie.ageRating}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mô tả</Text>
                <Text style={styles.description}>{currentMovie.description}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin</Text>
                <Text style={styles.info}>Đạo diễn: {currentMovie.director}</Text>
                <Text style={styles.info}>Diễn viên: {currentMovie.cast}</Text>
                <Text style={styles.info}>Ngôn ngữ: {currentMovie.language}</Text>
                <Text style={styles.info}>Phụ đề: {currentMovie.subtitle}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lịch chiếu</Text>
                {showtimes.map((showtime: any) => (
                    <TouchableOpacity
                        key={showtime.id}
                        style={styles.showtimeCard}
                        onPress={() => handleBookTicket(showtime)}
                    >
                        <View style={styles.showtimeInfo}>
                            <Text style={styles.showtimeTime}>
                                {showtime.startTime} - {showtime.endTime}
                            </Text>
                            <Text style={styles.showtimePrice}>
                                {showtime.price.toLocaleString()} VNĐ
                            </Text>
                        </View>
                        <Text style={styles.bookButton}>Đặt vé</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Đánh giá</Text>
                {reviews.map((review: any) => (
                    <View key={review.id} style={styles.reviewCard}>
                        <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
                        <Text style={styles.reviewComment}>{review.comment}</Text>
                        <Text style={styles.reviewUser}>- {review.user?.fullName}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    favouriteButton: {
        padding: 8,
    },
    favouriteText: {
        fontSize: 24,
    },
    movieInfo: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: 'white',
        marginTop: 1,
    },
    genre: {
        fontSize: 14,
        color: '#666',
    },
    duration: {
        fontSize: 14,
        color: '#666',
    },
    rating: {
        fontSize: 14,
        color: '#FFA500',
        fontWeight: 'bold',
    },
    ageRating: {
        fontSize: 14,
        color: '#666',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    section: {
        backgroundColor: 'white',
        marginTop: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    info: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    showtimeCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        marginBottom: 8,
    },
    showtimeInfo: {
        flex: 1,
    },
    showtimeTime: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    showtimePrice: {
        fontSize: 14,
        color: '#666',
    },
    bookButton: {
        backgroundColor: '#007AFF',
        color: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 'bold',
    },
    reviewCard: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    reviewRating: {
        fontSize: 16,
        color: '#FFA500',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    reviewComment: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    reviewUser: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
});
