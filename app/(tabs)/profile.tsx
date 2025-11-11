import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store';
import { logout } from '../../src/store/authSlice';

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
                    onPress={() => router.push('/favourites')}
                >
                    <Text style={styles.menuText}>Phim yêu thích</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => router.push('/cinemas')}
                >
                    <Text style={styles.menuText}>Rạp chiếu phim</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => router.push('/promotions')}
                >
                    <Text style={styles.menuText}>Khuyến mãi</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuText}>Cài đặt</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
                {user?.role === 'ADMIN' && (
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText}>Quản lý hệ thống</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                )}
                {user?.role === 'STAFF' && (
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuText}>Quản lý đặt vé</Text>
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
    menuText: {
        fontSize: 16,
        color: '#333',
    },
    menuArrow: {
        fontSize: 20,
        color: '#ccc',
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
});
