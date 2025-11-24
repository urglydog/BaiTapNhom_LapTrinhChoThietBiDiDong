import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { promotionService } from '../../src/services/promotionService';
import { Promotion } from '../../src/types';
import { useTranslation } from '../../src/localization';
import { lightTheme, darkTheme } from '../../src/themes';

export default function PromotionsTabScreen() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'available' | 'expired'>('active');
    const { theme } = useSelector((state: RootState) => state.theme);
    const t = useTranslation();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    useEffect(() => {
        fetchPromotions();
    }, [selectedFilter]);

    const fetchPromotions = async () => {
        try {
            setIsLoading(true);
            let data: Promotion[] = [];

            switch (selectedFilter) {
                case 'active':
                    data = await promotionService.getActivePromotions();
                    break;
                case 'available':
                    data = await promotionService.getAvailablePromotions();
                    break;
                case 'expired':
                    data = await promotionService.getExpiredPromotions();
                    break;
                default:
                    data = await promotionService.getAllPromotions();
            }

            setPromotions(data);
        } catch (error) {
            console.error('Error fetching promotions:', error);
            setPromotions([]);
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
        if (!promotion.discountValue) return t('Giảm giá');
        if (promotion.discountType === 'PERCENTAGE') {
            return t('Giảm {discountValue}%', { discountValue: promotion.discountValue });
        } else {
            return t('Giảm {discountValue} VNĐ', { discountValue: promotion.discountValue.toLocaleString() });
        }
    };

    const renderPromotion = ({ item }: { item: Promotion }) => {
        const isExpired = new Date(item.endDate) < new Date();
        const isUsedUp = item.usageLimit != null && item.usedCount != null &&
            item.usedCount >= item.usageLimit;

        return (
            <View style={[styles.promotionCard, { backgroundColor: currentTheme.card }, (isExpired || isUsedUp) && styles.expiredCard]}>
                <View style={styles.promotionHeader}>
                    <View style={[styles.promotionBadge, { backgroundColor: currentTheme.primary }]}>
                        <Text style={styles.promotionBadgeText}>
                            {getDiscountText(item)}
                        </Text>
                    </View>
                    {isExpired && (
                        <View style={[styles.expiredBadge, { backgroundColor: currentTheme.subtext }]}>
                            <Text style={styles.expiredBadgeText}>{t('Hết hạn')}</Text>
                        </View>
                    )}
                    {isUsedUp && !isExpired && (
                        <View style={[styles.usedUpBadge, { backgroundColor: currentTheme.warning }]}>
                            <Text style={styles.usedUpBadgeText}>{t('Đã hết')}</Text>
                        </View>
                    )}
                </View>
                {item.code && (
                    <View style={[styles.codeContainer, { backgroundColor: currentTheme.background }]}>
                        <Text style={[styles.codeLabel, { color: currentTheme.text }]}>{t('Mã:')}</Text>
                        <Text style={[styles.codeText, { color: currentTheme.primary }]}>{item.code}</Text>
                    </View>
                )}
                {item.name && (
                    <Text style={[styles.promotionName, { color: currentTheme.text }]}>{item.name}</Text>
                )}
                {item.description && (
                    <Text style={[styles.promotionDescription, { color: currentTheme.subtext }]}>{item.description}</Text>
                )}
                <View style={[styles.promotionDetails, { borderTopColor: currentTheme.border }]}>
                    {item.minAmount && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>💰</Text>
                            <Text style={[styles.promotionDetail, { color: currentTheme.text }]}>
                                {t('Đơn tối thiểu:')} {item.minAmount.toLocaleString()} {t('VNĐ')}
                            </Text>
                        </View>
                    )}
                    {item.maxDiscount && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>🎯</Text>
                            <Text style={[styles.promotionDetail, { color: currentTheme.text }]}>
                                {t('Giảm tối đa:')} {item.maxDiscount.toLocaleString()} {t('VNĐ')}
                            </Text>
                        </View>
                    )}
                    {item.endDate && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>📅</Text>
                            <Text style={[styles.promotionDetail, { color: currentTheme.text }]}>
                                {t('Áp dụng đến:')} {formatDate(item.endDate)}
                            </Text>
                        </View>
                    )}
                    {item.usageLimit && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>🎫</Text>
                            <Text style={[styles.promotionDetail, { color: currentTheme.text }]}>
                                {t('Còn lại:')} {item.usageLimit - (item.usedCount || 0)} / {item.usageLimit} {t('lượt')}
                            </Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity style={[styles.useButton, { backgroundColor: currentTheme.primary }, (isExpired || isUsedUp) && { backgroundColor: currentTheme.subtext }]} disabled={isExpired || isUsedUp}>
                    <Text style={styles.useButtonText}>
                        {isExpired ? t('Đã hết hạn') : isUsedUp ? t('Đã hết lượt') : t('Sử dụng mã')}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (isLoading && promotions.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: currentTheme.background }]}>
                <ActivityIndicator size="large" color={currentTheme.primary} />
                <Text style={[styles.loadingText, { color: currentTheme.text }]}>{t('Đang tải khuyến mãi...')}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
            <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
                <Text style={[styles.headerTitle, { color: '#fff' }]}>{t('Khuyến Mãi')}</Text>
                <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>
                    {promotions.length} {t('khuyến mãi')} {
                        selectedFilter === 'active' ? t('đang áp dụng') :
                            selectedFilter === 'available' ? t('có thể sử dụng') :
                                selectedFilter === 'expired' ? t('đã hết hạn') :
                                    t('tất cả')
                    }
                </Text>
            </View>

            <View style={[styles.filterContainer, { backgroundColor: currentTheme.card, borderBottomColor: currentTheme.border }]}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        { backgroundColor: currentTheme.background },
                        selectedFilter === 'active' && { backgroundColor: currentTheme.primary },
                    ]}
                    onPress={() => setSelectedFilter('active')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            { color: currentTheme.subtext },
                            selectedFilter === 'active' && { color: '#fff' },
                        ]}
                    >
                        {t('Đang áp dụng')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        { backgroundColor: currentTheme.background },
                        selectedFilter === 'available' && [styles.filterButtonActive, { backgroundColor: currentTheme.accent }],
                    ]}
                    onPress={() => setSelectedFilter('available')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            { color: currentTheme.subtext },
                            selectedFilter === 'available' && styles.filterTextActive,
                        ]}
                    >
                        {t('Có thể dùng')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        { backgroundColor: currentTheme.background },
                        selectedFilter === 'expired' && [styles.filterButtonActive, { backgroundColor: currentTheme.accent }],
                    ]}
                    onPress={() => setSelectedFilter('expired')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            { color: currentTheme.subtext },
                            selectedFilter === 'expired' && styles.filterTextActive,
                        ]}
                    >
                        {t('Đã hết hạn')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        { backgroundColor: currentTheme.background },
                        selectedFilter === 'all' && [styles.filterButtonActive, { backgroundColor: currentTheme.accent }],
                    ]}
                    onPress={() => setSelectedFilter('all')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            { color: currentTheme.subtext },
                            selectedFilter === 'all' && styles.filterTextActive,
                        ]}
                    >
                        {t('Tất cả')}
                    </Text>
                </TouchableOpacity>
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
                        <Text style={[styles.emptyText, { color: currentTheme.text }]}>
                            {t('Hiện không có khuyến mãi nào')}
                        </Text>
                        <Text style={[styles.emptySubtext, { color: currentTheme.subtext }]}>
                            {t('Vui lòng quay lại sau để xem các ưu đãi mới')}
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
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
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
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        alignItems: 'center',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContainer: {
        padding: 16,
    },
    promotionCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
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
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        flex: 1,
        marginRight: 8,
    },
    promotionBadgeText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    expiredBadge: {
        backgroundColor: '#999',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    expiredBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    usedUpBadge: {
        backgroundColor: '#FFA500',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    usedUpBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    codeLabel: {
        fontSize: 14,
        marginRight: 8,
        fontWeight: '600',
    },
    codeText: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    promotionName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    promotionDescription: {
        fontSize: 15,
        marginBottom: 16,
        lineHeight: 22,
    },
    promotionDetails: {
        borderTopWidth: 1,
        paddingTop: 12,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    promotionDetail: {
        fontSize: 14,
        flex: 1,
    },
    useButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    useButtonText: {
        color: 'white',
        fontSize: 16,
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
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});

