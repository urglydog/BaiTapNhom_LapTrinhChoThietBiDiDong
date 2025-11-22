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
    Switch
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../src/store';
import { logout } from '../../src/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/src/hooks/redux';
import { toggleTheme } from '@/src/store/themeSlice';
import { setLanguage } from '@/src/store/languageSlice';
import { darkTheme, lightTheme } from '@/src/themes';
import { useTranslation } from 'react-i18next';

import { MaterialIcons } from '@expo/vector-icons';

const MenuItem = ({ icon, text, onPress }: { icon: any, text: string, onPress: () => void }) => {
    const { theme } = useAppSelector((state) => state.theme);
    const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
    const styles = getStyles(currentTheme);
    return (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name={icon} size={24} color={currentTheme.text} />
                <Text style={styles.menuText}>{text}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
    );
};

export default function ProfileScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { theme } = useAppSelector((state) => state.theme);
    const { language } = useAppSelector((state) => state.language);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            setShowLogoutModal(true);
        } else {
            Alert.alert(
                t('Logout'),
                t('Are you sure you want to log out?'),
                [
                    { text: t('Cancel'), style: 'cancel' },
                    { text: t('Logout'), onPress: () => dispatch(logout()) }
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
            case 'ADMIN': return t('Administrator');
            case 'STAFF': return t('Staff');
            case 'CUSTOMER': return t('Customer');
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
    const styles = getStyles(currentTheme);

    if (!user) {
        return (
            <View style={[styles.container, styles.centeredContainer]}>
                <View style={styles.notLoggedInCard}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarLargeText}>?</Text>
                    </View>
                    <Text style={styles.notLoggedInTitle}>{t('You are not logged in')}</Text>
                    <Text style={styles.notLoggedInSubtitle}>{t('Please log in to use personalized functions!')}</Text>
                    <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
                        <Text style={styles.loginButtonText}>{t('Login')}</Text>
                    </TouchableOpacity>
                    <Text style={styles.orText}>{t('or')}</Text>
                    <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/register')}>
                        <Text style={styles.registerLinkText}>{t('Create an account')}</Text>
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
                        <Text style={styles.modalTitle}>{t('Logout')}</Text>
                        <Text style={styles.modalMessage}>{t('Are you sure you want to log out?')}</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={cancelLogout}>
                                <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={confirmLogout}>
                                <Text style={styles.confirmButtonText}>{t('Logout')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <ScrollView style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.name}>{user?.fullName}</Text>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role || '') }]}>
                            <Text style={styles.roleText}>
                                {getRoleDisplayName(user?.role || '')}
                            </Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={() => router.push('/edit-profile')} style={styles.editButton}>
                    <MaterialIcons name="edit" size={24} color={currentTheme.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('PersonalInformation')}</Text>
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('Email')}:</Text>
                        <Text style={styles.infoValue}>{user?.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('PhoneNumber')}:</Text>
                        <Text style={styles.infoValue}>{user?.phone}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('DateOfBirth')}:</Text>
                        <Text style={styles.infoValue}>
                            {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : 'N/A'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>{t('Gender')}:</Text>
                        <Text style={styles.infoValue}>
                            {user?.gender === 'MALE' ? t('Male') : user?.gender === 'FEMALE' ? t('Female') : 'N/A'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('Functions')}</Text>
                <MenuItem icon="favorite" text={t('FavoriteMovies')} onPress={() => router.push('/favourites')} />
                <MenuItem icon="theaters" text={t('Cinemas')} onPress={() => router.push('/cinemas')} />
                <MenuItem icon="local-offer" text={t('Promotions')} onPress={() => router.push('/promotions')} />
                <MenuItem icon="lock" text={t('ChangePassword')} onPress={() => router.push('/change-password')} />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('Settings')}</Text>
                <View style={styles.menuItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="brightness-6" size={24} color={currentTheme.text} />
                        <Text style={styles.menuText}>{t('Theme')}</Text>
                    </View>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={() => dispatch(toggleTheme())}
                    />
                </View>
                <View style={styles.menuItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="language" size={24} color={currentTheme.text} />
                        <Text style={styles.menuText}>{t('Language')}</Text>
                    </View>
                    <View style={styles.languageSelector}>
                        <TouchableOpacity
                            style={[styles.languageButton, language === 'vi' && styles.languageButtonSelected]}
                            onPress={() => dispatch(setLanguage('vi'))}
                        >
                            <Text style={styles.languageButtonText}>VIE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.languageButton, language === 'en' && styles.languageButtonSelected]}
                            onPress={() => dispatch(setLanguage('en'))}
                        >
                            <Text style={styles.languageButtonText}>ENG</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText} onPress={handleLogout}>{t('Logout')}</Text>
            </TouchableOpacity>
        </ScrollView>
        </>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    headerContainer: {
        backgroundColor: theme.card,
        marginBottom: 1,
        paddingTop: 30, // Add padding to the top for status bar
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative', // To position the edit button
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        flex: 1, // Take up available space
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    userInfo: {
        justifyContent: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 4,
    },
    roleBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    roleText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    editButton: {
        padding: 10,
        position: 'absolute',
        top: 40, // Adjust this value to position the button correctly
        right: 10,
    },
    section: {
        backgroundColor: theme.card,
        marginBottom: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 16,
    },
    infoCard: {
        backgroundColor: theme.background,
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
        color: theme.text,
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        color: theme.text,
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
        borderBottomColor: theme.border,
    },
    menuText: {
        fontSize: 16,
        color: theme.text,
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
        backgroundColor: theme.background,
    },
    notLoggedInCard: {
        backgroundColor: theme.card,
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
        color: theme.text,
        marginBottom: 8,
        textAlign: 'center',
    },
    notLoggedInSubtitle: {
        fontSize: 15,
        color: theme.text,
        marginBottom: 24,
        textAlign: 'center',
    },
    loginButton: {
        backgroundColor: theme.primary,
        paddingVertical: 14,
        paddingHorizontal: 48,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: theme.primary,
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
        color: theme.text,
        textAlign: 'center',
    },
    registerLink: {
        marginTop: 16,
        padding: 8,
    },
    registerLinkText: {
        color: theme.primary,
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
        backgroundColor: theme.card,
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
        color: theme.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        color: theme.text,
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
        backgroundColor: theme.background,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: theme.text,
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
    languageSelector: {
        flexDirection: 'row',
    },
    languageButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.background,
        marginHorizontal: 4,
    },
    languageButtonSelected: {
        backgroundColor: theme.primary,
    },
    languageButtonText: {
        color: theme.text,
        fontWeight: 'bold',
    },
});
