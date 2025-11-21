import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store';
import { logout, setUser } from '../../src/store/authSlice';

export default function ProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);


    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng xuất', onPress: () => dispatch(logout()) }
            ]
        );
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'Quản trị viên';
            case 'STAFF': return 'Nhân viên';
            case 'CUSTOMER': return 'Khách hàng';
            default: return role;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return '#FF6B6B';
            case 'STAFF': return '#4ECDC4';
            case 'CUSTOMER': return '#45B7D1';
            default: return '#666';
        }
    };

    if (!user) {
        return (
            <View style={[styles.container, styles.centeredContainer]}>
                <View style={styles.notLoggedInCard}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarLargeText}>?</Text>
                    </View>
                    <Text style={styles.notLoggedInTitle}>Bạn chưa đăng nhập</Text>
                    <Text style={styles.notLoggedInSubtitle}>Hãy đăng nhập để sử dụng các chức năng cá nhân hóa!</Text>
                    <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
                        <Text style={styles.loginButtonText}>Đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.fullName}</Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role || '') }]}>
                    <Text style={styles.roleText}>
                        {getRoleDisplayName(user?.role || '')}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tên đăng nhập:</Text>
                        <Text style={styles.infoValue}>{user?.username}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Số điện thoại:</Text>
                        <Text style={styles.infoValue}>{user?.phone}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ngày sinh:</Text>
                        <Text style={styles.infoValue}>
                            {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Giới tính:</Text>
                        <Text style={styles.infoValue}>
                            {user?.gender === 'MALE' ? 'Nam' : user?.gender === 'FEMALE' ? 'Nữ' : 'N/A'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Chức năng</Text>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push('/(tabs)/favourites')}
                >
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuIcon}>❤️</Text>
                        <Text style={styles.menuText}>Phim yêu thích</Text>
                    </View>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push('/(tabs)/cinemas')}
                >
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuIcon}>🎭</Text>
                        <Text style={styles.menuText}>Rạp chiếu phim</Text>
                    </View>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push('/(tabs)/promotions')}
                >
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuIcon}>🎁</Text>
                        <Text style={styles.menuText}>Khuyến mãi</Text>
                    </View>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuIcon}>⚙️</Text>
                        <Text style={styles.menuText}>Cài đặt</Text>
                    </View>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                {user?.role === 'ADMIN' && (
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Text style={styles.menuIcon}>👑</Text>
                            <Text style={styles.menuText}>Quản lý hệ thống</Text>
                        </View>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                )}
                {user?.role === 'STAFF' && (
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Text style={styles.menuIcon}>🎫</Text>
                            <Text style={styles.menuText}>Quản lý đặt vé</Text>
                        </View>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: 'white',
        alignItems: 'center',
        padding: 30,
        marginBottom: 1,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    roleBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    roleText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    section: {
        backgroundColor: 'white',
        marginBottom: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    infoCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    menuText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    menuArrow: {
        fontSize: 20,
        color: '#ccc',
        fontWeight: '300',
    },
    logoutButton: {
        backgroundColor: '#FF6B6B',
        margin: 20,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Đẹp cho phần chưa đăng nhập
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    notLoggedInCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        minWidth: 300,
        maxWidth: 350,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },
    avatarLargeText: {
        fontSize: 40,
        color: '#6366f1',
        fontWeight: 'bold',
    },
    notLoggedInTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#22223b',
        marginBottom: 8,
        textAlign: 'center',
    },
    notLoggedInSubtitle: {
        fontSize: 15,
        color: '#6c757d',
        marginBottom: 24,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        paddingHorizontal: 48,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
