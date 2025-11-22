import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '@/src/hooks/redux'; // Import useAppDispatch
import { darkTheme, lightTheme } from '@/src/themes';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { userService } from '@/src/services/userService'; // Import userService
import { setUser } from '@/src/store/authSlice'; // Import setUser action
import { User } from '@/src/types'; // Import User type

export default function EditProfileScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useAppDispatch(); // Initialize useAppDispatch
    const { theme } = useAppSelector((state) => state.theme);
    const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
    const styles = getStyles(currentTheme);

    const { user } = useSelector((state: RootState) => state.auth);

    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
    const [gender, setGender] = useState(user?.gender || 'MALE');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!user || !user.id) {
            Alert.alert(t('Error'), 'User not logged in or user ID not found.');
            return;
        }

        // Basic validation
        if (!fullName || !email || !phone || !dateOfBirth) {
            Alert.alert(t('Error'), t('Please fill in all fields'));
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Alert.alert(t('Error'), t('Invalid email'));
            return;
        }
        if (!/^\d{10,11}$/.test(phone)) {
            Alert.alert(t('Error'), t('Invalid phone number (10-11 digits)'));
            return;
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
            Alert.alert(t('Error'), t('Date of birth format must be YYYY-MM-DD'));
            return;
        }

        setIsLoading(true);
        try {
            let userToSend: User = {
                ...user!,
                fullName,
                email,
                phone,
                dateOfBirth,
                gender,
            };

            // Explicitly remove password if it exists in the Redux user object
            // Create a shallow copy to safely delete a property without modifying the original object (user!)
            const finalUserToSend: Partial<User> = { ...userToSend };
            if ('password' in finalUserToSend) {
                delete finalUserToSend.password;
            }
            
            const response = await userService.updateUser(user.id, finalUserToSend as User); // Cast back to User for the service method.
            dispatch(setUser(response)); // Update Redux store with the response from the API
            Alert.alert(t('Success'), 'Profile updated successfully!');
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(tabs)/profile'); // Fallback to profile tab if no history
            }
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            Alert.alert(t('Error'), error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={currentTheme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('EditProfile')}</Text>
            </View>
            <View style={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('FullName')}</Text>
                    <TextInput
                        style={[styles.input, { borderColor: currentTheme.border }]}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder={t('Enter full name')}
                        placeholderTextColor={currentTheme.textSecondary}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('Email')}</Text>
                    <TextInput
                        style={[styles.input, { borderColor: currentTheme.border }]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t('Enter your email')}
                        placeholderTextColor={currentTheme.textSecondary}
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('PhoneNumber')}</Text>
                    <TextInput
                        style={[styles.input, { borderColor: currentTheme.border }]}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder={t('Enter phone number')}
                        placeholderTextColor={currentTheme.textSecondary}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('DateOfBirth')}</Text>
                    <TextInput
                        style={[styles.input, { borderColor: currentTheme.border }]}
                        value={dateOfBirth}
                        onChangeText={setDateOfBirth}
                        placeholder={t('YYYY-MM-DD (e.g., 1990-01-15)')}
                        placeholderTextColor={currentTheme.textSecondary}
                        keyboardType="numbers-and-punctuation"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>{t('Gender')}</Text>
                    <View style={[styles.genderContainer, { borderColor: currentTheme.border }]}>
                        <TouchableOpacity
                            style={[styles.genderButton, gender === 'MALE' && { backgroundColor: currentTheme.primary }]}
                            onPress={() => setGender('MALE')}
                            disabled={isLoading}
                        >
                            <Text style={[styles.genderButtonText, gender === 'MALE' && { color: 'white' }]}>{t('Male')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.genderButton, gender === 'FEMALE' && { backgroundColor: currentTheme.primary }]}
                            onPress={() => setGender('FEMALE')}
                            disabled={isLoading}
                        >
                            <Text style={[styles.genderButtonText, gender === 'FEMALE' && { color: 'white' }]}>{t('Female')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>{t('SaveChanges')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.card,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.text,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 14,
        color: theme.text,
        marginBottom: 5,
        fontWeight: '500',
    },
    input: {
        backgroundColor: theme.card,
        color: theme.text,
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
    },
    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: theme.card,
        borderRadius: 8,
        borderWidth: 1,
    },
    genderButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        borderRadius: 7,
        margin: 2,
    },
    genderButtonText: {
        fontSize: 16,
        color: theme.text,
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: theme.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
