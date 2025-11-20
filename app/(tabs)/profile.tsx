import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
    Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../src/store';
import { logout } from '../../src/store/authSlice';

export default function ProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            setShowLogoutModal(true);
        } else {
            Alert.alert(
                'Đăng xuất',
                'Bạn có chắc chắn muốn đăng xuất?', 
                [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Đăng xuất', onPress: () => dispatch(logout()) }
                ]
            );
        }
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        dispatch(logout());
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
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
                    <Text style={styles.orText}>hoặc</Text>
                    <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/register')}>
                        <Text style={styles.registerLinkText}>Tạo tài khoản</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <>
            <Modal
                visible={showLogoutModal}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelLogout}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Đăng xuất</Text>
                        <Text style={styles.modalMessage}>Bạn có chắc chắn muốn đăng xuất?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={cancelLogout}>
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={confirmLogout}>
                                <Text style={styles.confirmButtonText}>Đăng xuất</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => router.push('/change-password')}
                >
                    <Text style={styles.menuText}>Đổi mật khẩu</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText} onPress={handleLogout}>Đăng xuất</Text>
            </TouchableOpacity>
        </ScrollView>
        </>
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
    orText: {
        marginTop: 12,
        marginBottom: 8,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    registerLink: {
        marginTop: 16,
        padding: 8,
    },
    registerLinkText: {
        color: '#007AFF',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        margin: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minWidth: 280,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 22,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#FF6B6B',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
