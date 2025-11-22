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
import { useAppSelector } from '@/src/hooks/redux';
import { darkTheme, lightTheme } from '@/src/themes';
import { useTranslation } from 'react-i18next';

export default function PromotionsScreen() {
  const { t } = useTranslation();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useAppSelector((state) => state.theme);
  const { language } = useAppSelector((state) => state.language);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(currentTheme);

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
      // If there is no API, use sample data from data.sql
      setPromotions([
        {
          id: 1,
          name: t('Welcome new customer'),
          description: t('10% off for the first order'),
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
          name: t('VIP customer'),
          description: t('20% off for VIP customers'),
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
          name: t('Happy weekend'),
          description: t('15% off for weekend shows'),
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
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDiscountText = (promotion: Promotion) => {
    if (!promotion.discountValue) return t('Discount');
    if (promotion.discountType === 'PERCENTAGE') {
      return t('{{discountValue}}% off', { discountValue: promotion.discountValue });
    } else {
      return t('{{discountValue}} VNĐ off', { discountValue: promotion.discountValue.toLocaleString() });
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
              <Text style={styles.expiredBadgeText}>{t('Expired')}</Text>
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
              {t('Min amount')}: {item.minAmount.toLocaleString()} VNĐ
            </Text>
          )}
          {item.maxDiscount && (
            <Text style={styles.promotionDetail}>
              {t('Max discount')}: {item.maxDiscount.toLocaleString()} VNĐ
            </Text>
          )}
          {item.endDate && (
            <Text style={styles.promotionDetail}>
              {t('Valid until')}: {formatDate(item.endDate)}
            </Text>
          )}
          {item.usageLimit && (
            <Text style={styles.promotionDetail}>
              {t('Usage limit')}: {item.usageLimit} {t('uses')}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={styles.loadingText}>{t('Loading promotions...')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('Promotions')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('{{count}} promotions currently active', { count: promotions.length })}
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
              {t('No promotions currently available')}
            </Text>
            <Text style={styles.emptySubtext}>
              {t('Please check back later for new offers')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.text,
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
    backgroundColor: theme.card,
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
    color: theme.text,
    marginBottom: 8,
  },
  promotionDescription: {
    fontSize: 14,
    color: theme.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  promotionDetails: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
  },
  promotionDetail: {
    fontSize: 12,
    color: theme.text,
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
    color: theme.text,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.text,
    textAlign: 'center',
  },
});

