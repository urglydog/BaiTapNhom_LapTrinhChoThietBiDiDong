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
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const { error } = useSelector((state: RootState) => state.auth);
    const { theme } = useSelector((state: RootState) => state.theme);
    const t = useTranslation();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;
    const router = useRouter();

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert(t('Lỗi'), t('Vui lòng nhập đầy đủ thông tin'));
            return;
        }

        setIsLoading(true);
        try {
            const result = await dispatch(login({ username, password })).unwrap();

            if(result) {
                Alert.alert(t('Thành công'), t('Đăng nhập thành công'));
                
                router.replace('/(tabs)');
            }

            if (result) {
                router.replace('/(tabs)/profile');
            }
        } catch (error) {
            Alert.alert(t('Đăng nhập thất bại'), error as string);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (error) {
            Alert.alert(t('Lỗi'), error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: currentTheme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: currentTheme.text }]}>Movie Ticket Booking</Text>
                    <Text style={[styles.subtitle, { color: currentTheme.subtext }]}>{t('Đăng nhập để tiếp tục')}</Text>
                </View>

                <View style={[styles.form, { backgroundColor: currentTheme.card }]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <Text style={[styles.backButtonText, { color: currentTheme.primary }]}>← {t('Quay lại')}</Text>
                    </TouchableOpacity>

                    <Text style={[styles.formTitle, { color: currentTheme.text }]}>{t('Đăng nhập')}</Text>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: currentTheme.text }]}>{t('Tên đăng nhập')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: currentTheme.background, color: currentTheme.text }]}
                            value={username}
                            onChangeText={setUsername}
                            placeholder={t('Nhập tên đăng nhập')}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: currentTheme.text }]}>{t('Mật khẩu')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: currentTheme.background, color: currentTheme.text }]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder={t('Nhập mật khẩu')}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, { backgroundColor: currentTheme.primary }, isLoading && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? t('Đang đăng nhập...') : t('Đăng nhập')}
                        </Text>
                    </TouchableOpacity>

                    <Text
                        style={{ marginTop: 20, textAlign: 'center', color: currentTheme.text }}
                    >
                        {t('Bạn chưa có tài khoản')} 
                        <TouchableOpacity 
                            onPress={() => router.push('/register')}
                        >
                                <Text style={{color: currentTheme.primary}}> {t('Đăng ký ngay')}</Text>
                        </TouchableOpacity>
                    </Text>

                    <TouchableOpacity 
                            onPress={() => router.push('/forgot-password')}
                            style={{ marginTop: 10, alignSelf: 'center' }}
                        >
                                <Text style={{color: currentTheme.primary}}> {t('Quên mật khẩu?')}</Text>
                        </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: currentTheme.subtext }]}>
                        Demo accounts:
                    </Text>
                    <Text style={[styles.demoText, { color: currentTheme.subtext }]}>Admin: admin / password</Text>
                    <Text style={[styles.demoText, { color: currentTheme.subtext }]}>Staff: staff1 / password</Text>
                    <Text style={[styles.demoText, { color: currentTheme.subtext }]}>Customer: customer1 / password</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    form: {
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
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    loginButton: {
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
        marginBottom: 8,
    },
    demoText: {
        fontSize: 12,
        marginBottom: 4,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 16,
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    formTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
});
