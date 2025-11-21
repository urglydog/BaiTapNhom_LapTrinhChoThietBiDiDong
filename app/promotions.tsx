import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { promotionService } from '../src/services/promotionService';
import { Promotion } from '../src/types';

export default function PromotionsScreen() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      const data = await promotionService.getActivePromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      // Nếu không có API, sử dụng dữ liệu mẫu từ data.sql
      setPromotions([
        {
          id: 1,
          name: 'Chào mừng khách hàng mới',
          description: 'Giảm 10% cho đơn hàng đầu tiên',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          minAmount: 100000,
          maxDiscount: 50000,
          startDate: '2023-01-01T00:00:00',
          endDate: '2023-12-31T23:59:59',
          usageLimit: 1000,
        },
        {
          id: 2,
          name: 'Khách hàng VIP',
          description: 'Giảm 20% cho khách hàng VIP',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          minAmount: 200000,
          maxDiscount: 100000,
          startDate: '2023-01-01T00:00:00',
          endDate: '2023-12-31T23:59:59',
          usageLimit: 500,
        },
        {
          id: 3,
          name: 'Cuối tuần vui vẻ',
          description: 'Giảm 15% cho suất chiếu cuối tuần',
          discountType: 'PERCENTAGE',
          discountValue: 15,
          minAmount: 150000,
          maxDiscount: 75000,
          startDate: '2023-01-01T00:00:00',
          endDate: '2023-12-31T23:59:59',
          usageLimit: 200,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPromotions();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDiscountText = (promotion: Promotion) => {
    if (!promotion.discountValue) return 'Giảm giá';
    if (promotion.discountType === 'PERCENTAGE') {
      return `Giảm ${promotion.discountValue}%`;
    } else {
      return `Giảm ${promotion.discountValue.toLocaleString()} VNĐ`;
    }
  };

  const renderPromotion = ({ item }: { item: Promotion }) => {
    const isExpired = new Date(item.endDate) < new Date();

    return (
      <View style={[styles.promotionCard, isExpired && styles.expiredCard]}>
        <View style={styles.promotionHeader}>
          <View style={styles.promotionBadge}>
            <Text style={styles.promotionBadgeText}>
              {getDiscountText(item)}
            </Text>
          </View>
          {isExpired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredBadgeText}>Hết hạn</Text>
            </View>
          )}
        </View>
        {item.name && (
          <Text style={styles.promotionName}>{item.name}</Text>
        )}
        {item.description && (
          <Text style={styles.promotionDescription}>{item.description}</Text>
        )}
        <View style={styles.promotionDetails}>
          {item.minAmount && (
            <Text style={styles.promotionDetail}>
              Đơn tối thiểu: {item.minAmount.toLocaleString()} VNĐ
            </Text>
          )}
          {item.maxDiscount && (
            <Text style={styles.promotionDetail}>
              Giảm tối đa: {item.maxDiscount.toLocaleString()} VNĐ
            </Text>
          )}
          {item.endDate && (
            <Text style={styles.promotionDetail}>
              Áp dụng đến: {formatDate(item.endDate)}
            </Text>
          )}
          {item.usageLimit && (
            <Text style={styles.promotionDetail}>
              Số lượng: {item.usageLimit} lượt
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải khuyến mãi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Khuyến Mãi</Text>
        <Text style={styles.headerSubtitle}>
          {promotions.length} khuyến mãi đang áp dụng
        </Text>
      </View>

      <FlatList
        data={promotions}
        renderItem={renderPromotion}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎁</Text>
            <Text style={styles.emptyText}>
              Hiện không có khuyến mãi nào
            </Text>
            <Text style={styles.emptySubtext}>
              Vui lòng quay lại sau để xem các ưu đãi mới
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
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
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
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  listContainer: {
    padding: 16,
  },
  promotionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expiredCard: {
    opacity: 0.6,
  },
  promotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promotionBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  promotionBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  expiredBadge: {
    backgroundColor: '#999',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredBadgeText: {
    color: 'white',
    fontSize: 12,
  },
  promotionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  promotionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  promotionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  promotionDetail: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

