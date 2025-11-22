import { navigate } from 'expo-router/build/global-state/routing';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../src/store';
import { clearError, login } from '../src/store/authSlice';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/src/hooks/redux';
import { darkTheme, lightTheme } from '@/src/themes';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const { error } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const { theme } = useAppSelector((state) => state.theme);
    const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
    const styles = getStyles(currentTheme);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert(t('Error'), t('Please fill in all fields'));
            return;
        }

        setIsLoading(true);
        try {
            const result = await dispatch(login({ username, password })).unwrap();

            if(result) {
                Alert.alert(t('Success'), t('Login successful'));
                
                router.replace('/(tabs)');
            }

            if (result) {
                router.replace('/(tabs)/profile');
            }
        } catch (error) {
            Alert.alert(t('Login failed'), error as string);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (error) {
            Alert.alert('Lỗi', error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>{t('Movie Ticket Booking')}</Text>
                    <Text style={styles.subtitle}>{t('Login to continue')}</Text>
                </View>

                <View style={styles.form}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <Text style={styles.backButtonText}>← {t('Back')}</Text>
                    </TouchableOpacity>

                    <Text style={styles.formTitle}>{t('Login')}</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('Username')}</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder={t('Enter username')}
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor={currentTheme.text}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('Password')}</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder={t('Enter password')}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                            placeholderTextColor={currentTheme.text}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? t('Logging in...') : t('Login')}
                        </Text>
                    </TouchableOpacity>

                    <Text
                        style={{ marginTop: 20, textAlign: 'center', color: currentTheme.text }}
                    >
                        {t('Don\'t have an account? ')}
                        <TouchableOpacity
                            onPress={() => router.push('/register')}
                        >
                            <Text style={{ color: currentTheme.primary }}>{t('Register now')}</Text>
                        </TouchableOpacity>
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push('/forgot-password')}
                        style={{ marginTop: 10, alignSelf: 'center' }}
                    >
                        <Text style={{ color: currentTheme.primary }}>{t('Forgot password?')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Demo accounts:
                    </Text>
                    <Text style={styles.demoText}>Admin: admin / password</Text>
                    <Text style={styles.demoText}>Staff: staff1 / password</Text>
                    <Text style={styles.demoText}>Customer: customer1 / password</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: theme.text,
    },
    form: {
        backgroundColor: theme.card,
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: theme.background,
        color: theme.text,
    },
    loginButton: {
        backgroundColor: theme.primary,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        marginTop: 30,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: theme.text,
        marginBottom: 8,
    },
    demoText: {
        fontSize: 12,
        color: theme.text,
        marginBottom: 4,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 16,
        padding: 8,
    },
    backButtonText: {
        color: theme.primary,
        fontSize: 16,
        fontWeight: '500',
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        textAlign: 'center',
        marginBottom: 24,
    },
});
