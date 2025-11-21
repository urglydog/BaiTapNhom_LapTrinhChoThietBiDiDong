import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { showtimeService } from "../src/services/showtimeService";
import { SeatWithStatus, Showtime } from "../src/types";

export default function SeatSelectionScreen() {
  const router = useRouter();
  const {
    showtimeId,
    movieTitle: movieTitleParam,
    cinemaName: cinemaNameParam,
    hallName: hallNameParam,
    showDate: showDateParam,
    showTime: showTimeParam,
    price: priceParam,
  } = useLocalSearchParams();

  const [seats, setSeats] = useState<SeatWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [movieTitle, setMovieTitle] = useState<string>(movieTitleParam as string || '');
  const [cinemaName, setCinemaName] = useState<string>(cinemaNameParam as string || '');
  const [hallName, setHallName] = useState<string>(hallNameParam as string || '');
  const [showDate, setShowDate] = useState<string>(showDateParam as string || '');
  const [showTime, setShowTime] = useState<string>(showTimeParam as string || '');
  const [price, setPrice] = useState<string>(priceParam as string || '0');

  // Load seats and showtime info when component mounts
  useEffect(() => {
    if (showtimeId) {
      loadShowtimeAndSeats();
    }
  }, [showtimeId]);

  const loadShowtimeAndSeats = async () => {
    try {
      setLoading(true);
      console.log("🪑 Loading showtime and seats:", showtimeId);
      
      // Load showtime details nếu thiếu thông tin
      if (!movieTitleParam || !cinemaNameParam || !hallNameParam) {
        try {
          const showtimeData = await showtimeService.getShowtimeById(Number(showtimeId));
          setShowtime(showtimeData);
          
          if (!movieTitleParam && showtimeData.movie) {
            setMovieTitle(showtimeData.movie.title);
          }
          if (!cinemaNameParam && showtimeData.cinemaHall) {
            // Load cinema hall để lấy thông tin cinema
            try {
              const { cinemaService } = await import('../src/services/cinemaService');
              const hallInfo = await cinemaService.getCinemaHallById(showtimeData.cinemaHallId);
              // Note: CinemaHall có thể không có cinema info trực tiếp
              // Cần load cinema riêng nếu cần, tạm thời dùng fallback
              setCinemaName('Rạp chiếu');
            } catch (e) {
              console.error('Error loading cinema hall:', e);
              setCinemaName('Rạp chiếu');
            }
          }
          if (!hallNameParam && showtimeData.cinemaHall) {
            setHallName(showtimeData.cinemaHall.hallName);
          }
          if (!showDateParam && showtimeData.showDate) {
            setShowDate(showtimeData.showDate);
          }
          if (!showTimeParam && showtimeData.startTime) {
            setShowTime(showtimeData.startTime);
          }
          if (!priceParam && showtimeData.price) {
            setPrice(showtimeData.price.toString());
          }
        } catch (error) {
          console.error('Error loading showtime:', error);
        }
      }
      
      // Fetch all seats for this showtime with status
      const seatsData = await showtimeService.getSeatsWithStatus(Number(showtimeId));
      
      console.log("📊 Total seats loaded:", seatsData.length);
      console.log("🔍 First seat structure:", seatsData[0]);
      console.log("🔍 Seat row info:", {
        seatRow: seatsData[0]?.seatRow,
        seatNumber: seatsData[0]?.seatNumber,
        price: seatsData[0]?.price,
      });
      
      // Add isSelected property to each seat
      const seatsWithSelection = seatsData.map((seat: SeatWithStatus) => ({
        ...seat,
        isSelected: false
      }));
      
      setSeats(seatsWithSelection);
      
      // Count seat status
      const availableCount = seatsData.filter((s: SeatWithStatus) => !s.isBooked).length;
      const bookedCount = seatsData.filter((s: SeatWithStatus) => s.isBooked).length;
      
      console.log("✅ Available seats:", availableCount);
      console.log("❌ Booked seats:", bookedCount);
      
    } catch (error: any) {
      console.error("❌ Error loading seats:", error);
      Alert.alert("Lỗi", error.message || "Không thể tải danh sách ghế");
    } finally {
      setLoading(false);
    }
  };

  const handleSeatPress = (seat: SeatWithStatus) => {
    // Can't select booked seats
    if (seat.isBooked) {
      Alert.alert("Thông báo", "Ghế này đã được đặt");
      return;
    }

    // Toggle selection
    if (selectedSeats.includes(seat.id)) {
      // Deselect
      setSelectedSeats(selectedSeats.filter((id) => id !== seat.id));
      setSeats(
        seats.map((s) =>
          s.id === seat.id ? { ...s, isSelected: false } : s
        )
      );
    } else {
      // Select
      setSelectedSeats([...selectedSeats, seat.id]);
      setSeats(
        seats.map((s) =>
          s.id === seat.id ? { ...s, isSelected: true } : s
        )
      );
    }
  };

  const getSeatColor = (seat: SeatWithStatus) => {
    if (seat.isSelected) return "#E91E63"; // Pink - Selected
    if (seat.isBooked) return "#000000"; // Black - Booked (với avatar)
    if (seat.seatType === "VIP") return "#FFB3BA"; // Light pink/coral - VIP
    if (seat.seatType === "COUPLE") return "#FFB3BA"; // Same as VIP
    return "#E6D5F5"; // Light purple - Normal
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      // Ưu tiên lấy giá từ seat.price, nếu không có thì dùng price từ showtime
      const seatPrice = seat?.price || Number(price) || 0;
      return total + seatPrice;
    }, 0);
  };

  const handleConfirmBooking = () => {
    if (selectedSeats.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn ít nhất một ghế");
      return;
    }

    const selectedSeatsData = seats.filter((s) => selectedSeats.includes(s.id));
    
    console.log("🎟️ Booking seats:", selectedSeatsData);

    router.push({
      pathname: "/booking",
      params: {
        showtimeId: String(showtimeId),
        movieTitle: movieTitle || movieTitleParam || '',
        cinemaName: cinemaName || cinemaNameParam || '',
        hallName: hallName || hallNameParam || '',
        showDate: showDate || showDateParam || '',
        showTime: showTime || showTimeParam || '',
        seatIds: JSON.stringify(selectedSeats),
        seatNumbers: selectedSeatsData.map((s) => s.seatNumber).join(", "),
        totalAmount: String(calculateTotal()),
      },
    });
  };

  // Group seats by row (A, B, C...)
  const groupSeatsByRow = () => {
    const grouped: { [key: string]: SeatWithStatus[] } = {};
    
    seats.forEach((seat) => {
      const row = seat.seatRow; // Sử dụng seatRow (A, B, C...) thay vì rowNumber
      if (!row) return;
      if (!grouped[row]) {
        grouped[row] = [];
      }
      grouped[row].push(seat);
    });

    // Sort seats within each row by seat number (convert string to number for comparison)
    Object.keys(grouped).forEach((row) => {
      grouped[row].sort((a, b) => {
        const numA = parseInt(a.seatNumber) || 0;
        const numB = parseInt(b.seatNumber) || 0;
        return numA - numB;
      });
    });

    return grouped;
  };

  const groupedSeats = groupSeatsByRow();
  const sortedRows = Object.keys(groupedSeats).sort(); // A, B, C... sẽ tự động sort đúng

  const formatDate = (dateStr: string | undefined | string[]) => {
    if (!dateStr) return "--/--";
    const dateString = Array.isArray(dateStr) ? dateStr[0] : dateStr;
    if (typeof dateString !== 'string') return "--/--";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (time: string | undefined | string[]) => {
    if (!time) return "--:--";
    const timeStr = Array.isArray(time) ? time[0] : time;
    if (typeof timeStr !== 'string') return "--:--";
    return timeStr.substring(0, 5); // "10:00:00" -> "10:00"
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#E91E63" />
        <Text style={styles.loadingText}>Đang tải sơ đồ ghế...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{movieTitle || 'Chọn ghế'}</Text>
          <Text style={styles.headerSubtitle}>
            {cinemaName} • {hallName}
          </Text>
          <Text style={styles.headerSubtitle}>
            {formatDate(showDate)} • {formatTime(showTime)}
          </Text>
        </View>
      </View>

      {/* Screen */}
      <View style={styles.screenContainer}>
        <View style={styles.screenWrapper}>
          <View style={styles.screen} />
        </View>
        <Text style={styles.screenText}>MÀN HÌNH</Text>
      </View>

      {/* Seats Grid */}
      <ScrollView style={styles.seatsScrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.seatsContainer}>
          {sortedRows.map((row) => (
            <View key={row} style={styles.seatRow}>
              <Text style={styles.rowLabel}>{row}</Text>
              <View style={styles.rowSeats}>
                {groupedSeats[row].map((seat: SeatWithStatus) => {
                  const isCouple = seat.seatType === "COUPLE";
                  return (
                    <TouchableOpacity
                      key={seat.id}
                      style={[
                        styles.seat,
                        isCouple && styles.coupleSeat,
                        { backgroundColor: getSeatColor(seat) },
                      ]}
                      onPress={() => handleSeatPress(seat)}
                      disabled={seat.isBooked}
                    >
                      {seat.isBooked ? (
                        <View style={styles.bookedSeatContent}>
                          <Ionicons name="person" size={16} color="#fff" />
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.seatText,
                            isCouple && styles.coupleSeatText,
                          ]}
                        >
                          {seat.seatNumber}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.bookedLegendBox}>
            <Ionicons name="person" size={12} color="#fff" />
          </View>
          <Text style={styles.legendText}>Đã đặt</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#E91E63" }]} />
          <Text style={styles.legendText}>Ghế bạn chọn</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#E6D5F5" }]} />
          <Text style={styles.legendText}>Ghế thường</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#FFB3BA" }]} />
          <Text style={styles.legendText}>Ghế VIP</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: "#D3D3D3" }]} />
          <Text style={styles.legendText}>Ghế couple</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryLabel}>Tạm tính</Text>
          <Text style={styles.summaryValue}>
            {selectedSeats.length} ghế • {calculateTotal().toLocaleString("vi-VN")}đ
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            selectedSeats.length === 0 && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmBooking}
          disabled={selectedSeats.length === 0}
        >
          <Text style={styles.confirmButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingTop: 50,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  screenContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  screenWrapper: {
    width: "90%",
    alignItems: "center",
    marginBottom: 12,
  },
  screen: {
    width: "100%",
    height: 6,
    backgroundColor: "#E91E63",
    borderRadius: 100,
  },
  screenText: {
    fontSize: 13,
    color: "#999",
    letterSpacing: 4,
    fontWeight: "500",
  },
  seatsScrollView: {
    flex: 1,
  },
  seatsContainer: {
    padding: 16,
  },
  seatRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rowLabel: {
    width: 30,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  rowSeats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  seat: {
    width: 32,
    height: 32,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  coupleSeat: {
    width: 68,
    borderRadius: 4,
  },
  seatText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
  },
  coupleSeatText: {
    fontSize: 10,
  },
  bookedSeatContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fafafa",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendBox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    marginRight: 6,
  },
  bookedLegendBox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  legendText: {
    fontSize: 10,
    color: "#666",
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 12,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#E91E63",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#ccc",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});