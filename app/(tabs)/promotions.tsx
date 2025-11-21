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
import { promotionService } from '../../src/services/promotionService';
import { Promotion } from '../../src/types';

export default function PromotionsTabScreen() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'available' | 'expired'>('active');

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
        if (!promotion.discountValue) return 'Giảm giá';
        if (promotion.discountType === 'PERCENTAGE') {
            return `Giảm ${promotion.discountValue}%`;
        } else {
            return `Giảm ${promotion.discountValue.toLocaleString()} VNĐ`;
        }
    };

    const renderPromotion = ({ item }: { item: Promotion }) => {
        const isExpired = new Date(item.endDate) < new Date();
        const isUsedUp = item.usageLimit != null && item.usedCount != null &&
            item.usedCount >= item.usageLimit;

        return (
            <View style={[styles.promotionCard, (isExpired || isUsedUp) && styles.expiredCard]}>
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
                    {isUsedUp && !isExpired && (
                        <View style={styles.usedUpBadge}>
                            <Text style={styles.usedUpBadgeText}>Đã hết</Text>
                        </View>
                    )}
                </View>
                {item.code && (
                    <View style={styles.codeContainer}>
                        <Text style={styles.codeLabel}>Mã:</Text>
                        <Text style={styles.codeText}>{item.code}</Text>
                    </View>
                )}
                {item.name && (
                    <Text style={styles.promotionName}>{item.name}</Text>
                )}
                {item.description && (
                    <Text style={styles.promotionDescription}>{item.description}</Text>
                )}
                <View style={styles.promotionDetails}>
                    {item.minAmount && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>💰</Text>
                            <Text style={styles.promotionDetail}>
                                Đơn tối thiểu: {item.minAmount.toLocaleString()} VNĐ
                            </Text>
                        </View>
                    )}
                    {item.maxDiscount && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>🎯</Text>
                            <Text style={styles.promotionDetail}>
                                Giảm tối đa: {item.maxDiscount.toLocaleString()} VNĐ
                            </Text>
                        </View>
                    )}
                    {item.endDate && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>📅</Text>
                            <Text style={styles.promotionDetail}>
                                Áp dụng đến: {formatDate(item.endDate)}
                            </Text>
                        </View>
                    )}
                    {item.usageLimit && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>🎫</Text>
                            <Text style={styles.promotionDetail}>
                                Còn lại: {item.usageLimit - (item.usedCount || 0)} / {item.usageLimit} lượt
                            </Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity style={styles.useButton} disabled={isExpired || isUsedUp}>
                    <Text style={styles.useButtonText}>
                        {isExpired ? 'Đã hết hạn' : isUsedUp ? 'Đã hết lượt' : 'Sử dụng mã'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (isLoading && promotions.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
                <Text style={styles.loadingText}>Đang tải khuyến mãi...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Khuyến Mãi</Text>
                <Text style={styles.headerSubtitle}>
                    {promotions.length} khuyến mãi {
                        selectedFilter === 'active' ? 'đang áp dụng' :
                            selectedFilter === 'available' ? 'có thể sử dụng' :
                                selectedFilter === 'expired' ? 'đã hết hạn' :
                                    'tất cả'
                    }
                </Text>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        selectedFilter === 'active' && styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedFilter('active')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            selectedFilter === 'active' && styles.filterTextActive,
                        ]}
                    >
                        Đang áp dụng
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        selectedFilter === 'available' && styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedFilter('available')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            selectedFilter === 'available' && styles.filterTextActive,
                        ]}
                    >
                        Có thể dùng
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        selectedFilter === 'expired' && styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedFilter('expired')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            selectedFilter === 'expired' && styles.filterTextActive,
                        ]}
                    >
                        Đã hết hạn
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        selectedFilter === 'all' && styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedFilter('all')}
                >
                    <Text
                        style={[
                            styles.filterText,
                            selectedFilter === 'all' && styles.filterTextActive,
                        ]}
                    >
                        Tất cả
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
        backgroundColor: '#f3f6fb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f6fb',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    header: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#FF6B6B',
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
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#FF6B6B',
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    filterTextActive: {
        color: 'white',
    },
    listContainer: {
        padding: 16,
    },
    promotionCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
    },
    expiredCard: {
        opacity: 0.6,
        borderLeftColor: '#999',
    },
    promotionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    promotionBadge: {
        backgroundColor: '#FF6B6B',
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
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    codeLabel: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
        fontWeight: '600',
    },
    codeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B6B',
        letterSpacing: 2,
    },
    promotionName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    promotionDescription: {
        fontSize: 15,
        color: '#666',
        marginBottom: 16,
        lineHeight: 22,
    },
    promotionDetails: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
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
        color: '#666',
        flex: 1,
    },
    useButton: {
        backgroundColor: '#FF6B6B',
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

