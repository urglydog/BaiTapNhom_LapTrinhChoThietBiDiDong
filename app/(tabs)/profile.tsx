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
    Switch,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../src/store';
import { logout } from '../../src/store/authSlice';
import { setTheme } from '../../src/store/themeSlice';
import { setLanguage } from '../../src/store/languageSlice';
import { useTranslation } from '../../src/localization';
import { lightTheme, darkTheme } from '../../src/themes';

export default function ProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { theme } = useSelector((state: RootState) => state.theme);
    const { language } = useSelector((state: RootState) => state.language);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const t = useTranslation();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        dispatch(logout());
    };

    const getRoleDisplayName = (role: string) => {
        return t(role as any);
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return '#FF6B6B';
            case 'STAFF': return '#4ECDC4';
            case 'CUSTOMER': return '#45B7D1';
            default: return '#666';
        }
    };

    const toggleTheme = () => {
        dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
    };

    const toggleLanguage = () => {
        dispatch(setLanguage(language === 'vi' ? 'en' : 'vi'));
    };

    if (!user) {
        return (
            <View style={[styles.container, styles.centeredContainer, { backgroundColor: currentTheme.background }]}>
                <View style={[styles.notLoggedInCard, { backgroundColor: currentTheme.card }]}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarLargeText}>?</Text>
                    </View>
                    <Text style={[styles.notLoggedInTitle, { color: currentTheme.text }]}>{t('Bạn chưa đăng nhập')}</Text>
                    <Text style={[styles.notLoggedInSubtitle, { color: currentTheme.subtext }]}>{t('Hãy đăng nhập để sử dụng các chức năng cá nhân hóa!')}</Text>
                    <TouchableOpacity style={[styles.loginButton, { backgroundColor: currentTheme.primary }]} onPress={() => router.push('/login')}>
                        <Text style={styles.loginButtonText}>{t('Đăng nhập')}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.orText, { color: currentTheme.subtext }]}>{t('hoặc')}</Text>
                    <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/register')}>
                        <Text style={[styles.registerLinkText, { color: currentTheme.primary }]}>{t('Tạo tài khoản')}</Text>
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
                    <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
                        <Text style={[styles.modalTitle, { color: currentTheme.text }]}>{t('Đăng xuất')}</Text>
                        <Text style={[styles.modalMessage, { color: currentTheme.subtext }]}>{t('Bạn có chắc chắn muốn đăng xuất?')}</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: currentTheme.background }]} onPress={cancelLogout}>
                                <Text style={[styles.cancelButtonText, { color: currentTheme.text }]}>{t('Hủy')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.confirmButton, { backgroundColor: currentTheme.accent }]} onPress={confirmLogout}>
                                <Text style={styles.confirmButtonText}>{t('Đăng xuất')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={showSettingsModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSettingsModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: currentTheme.card }]}>
                        <Text style={[styles.modalTitle, { color: currentTheme.text }]}>{t('Cài đặt')}</Text>
                        <View style={styles.settingRow}>
                            <Text style={[styles.settingText, { color: currentTheme.text }]}>{t('Chế độ tối')}</Text>
                            <Switch
                                value={theme === 'dark'}
                                onValueChange={toggleTheme}
                            />
                        </View>
                        <View style={styles.settingRow}>
                            <Text style={[styles.settingText, { color: currentTheme.text }]}>{t('Ngôn ngữ (English/Tiếng Việt)')}</Text>
                            <Switch
                                value={language === 'en'}
                                onValueChange={toggleLanguage}
                            />
                        </View>
                        <TouchableOpacity style={[styles.closeButton, { backgroundColor: currentTheme.primary }]} onPress={() => setShowSettingsModal(false)}>
                            <Text style={styles.closeButtonText}>{t('Đóng')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
            <View style={[styles.header, { backgroundColor: currentTheme.card }]}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>
                <Text style={[styles.name, { color: currentTheme.text }]}>{user?.fullName}</Text>
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role || '') }]}>
                    <Text style={styles.roleText}>
                        {getRoleDisplayName(user?.role || '')}
                    </Text>
                </View>
            </View>

            <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
                <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{t('Thông tin cá nhân')}</Text>
                <View style={[styles.infoCard, { backgroundColor: currentTheme.background }]}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>{t('Tên đăng nhập:')}</Text>
                        <Text style={[styles.infoValue, { color: currentTheme.text }]}>{user?.username}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>{t('Email:')}</Text>
                        <Text style={[styles.infoValue, { color: currentTheme.text }]}>{user?.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>{t('Số điện thoại:')}</Text>
                        <Text style={[styles.infoValue, { color: currentTheme.text }]}>{user?.phone}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>{t('Ngày sinh:')}</Text>
                        <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                            {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString(t('vi-VN')) : t('N/A')}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: currentTheme.subtext }]}>{t('Giới tính:')}</Text>
                        <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                            {t(user?.gender === 'MALE' ? 'Nam' : user?.gender === 'FEMALE' ? 'Nữ' : 'N/A')}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={[styles.section, { backgroundColor: currentTheme.card }]}>
                <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>{t('Chức năng')}</Text>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push('/(tabs)/favourites')}
                >
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuIcon}>❤️</Text>
                        <Text style={[styles.menuText, { color: currentTheme.text }]}>{t('Phim yêu thích')}</Text>
                    </View>
                    <Text style={[styles.menuArrow, { color: currentTheme.subtext }]}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push('/(tabs)/cinemas')}
                >
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuIcon}>🎭</Text>
                        <Text style={[styles.menuText, { color: currentTheme.text }]}>{t('Cinema')}</Text>
                    </View>
                    <Text style={[styles.menuArrow, { color: currentTheme.subtext }]}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push('/(tabs)/promotions')}
                >
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuIcon}>🎁</Text>
                        <Text style={[styles.menuText, { color: currentTheme.text }]}>{t('Khuyến mãi')}</Text>
                    </View>
                    <Text style={[styles.menuArrow, { color: currentTheme.subtext }]}>›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => setShowSettingsModal(true)}>
                    <View style={styles.menuItemLeft}>
                        <Text style={styles.menuIcon}>⚙️</Text>
                        <Text style={[styles.menuText, { color: currentTheme.text }]}>{t('Cài đặt')}</Text>
                    </View>
                    <Text style={[styles.menuArrow, { color: currentTheme.subtext }]}>›</Text>
                </TouchableOpacity>
                {user?.role === 'ADMIN' && (
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Text style={styles.menuIcon}>👑</Text>
                            <Text style={[styles.menuText, { color: currentTheme.text }]}>{t('Quản lý hệ thống')}</Text>
                        </View>
                        <Text style={[styles.menuArrow, { color: currentTheme.subtext }]}>›</Text>
                    </TouchableOpacity>
                )}
                {user?.role === 'STAFF' && (
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <Text style={styles.menuIcon}>🎫</Text>
                            <Text style={[styles.menuText, { color: currentTheme.text }]}>{t('Quản lý đặt vé')}</Text>
                        </View>
                        <Text style={[styles.menuArrow, { color: currentTheme.subtext }]}>›</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => router.push('/change-password')}
                >
                    <Text style={[styles.menuText, { color: currentTheme.text }]}>{t('Đổi mật khẩu')}</Text>
                    <Text style={[styles.menuArrow, { color: currentTheme.subtext }]}>›</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: currentTheme.accent }]} onPress={handleLogout}>
                <Text style={styles.logoutButtonText} onPress={handleLogout}>{t('Đăng xuất')}</Text>
            </TouchableOpacity>
        </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
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
        marginBottom: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    infoCard: {
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
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
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
        fontWeight: '500',
    },
    menuArrow: {
        fontSize: 20,
        fontWeight: '300',
    },
    logoutButton: {
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
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notLoggedInCard: {
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
        marginBottom: 8,
        textAlign: 'center',
    },
    notLoggedInSubtitle: {
        fontSize: 15,
        marginBottom: 24,
        textAlign: 'center',
    },
    loginButton: {
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
        textAlign: 'center',
    },
    registerLink: {
        marginTop: 16,
        padding: 8,
    },
    registerLinkText: {
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
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
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
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
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
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 12,
    },
    settingText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 48,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});