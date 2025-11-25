import { navigate } from 'expo-router/build/global-state/routing';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { 
    GoogleSignin,
    isSuccessResponse,
    isErrorWithCode,
    statusCodes
 } from "@react-native-google-signin/google-signin"

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../src/store';
import { clearError, googleLogin, login } from '../src/store/authSlice';
import { useRouter } from 'expo-router';
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';
import { configureGoogleSignIn, signInWithGoogle } from '../src/config/googleSignIn';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const { error } = useSelector((state: RootState) => state.auth);
    const { theme } = useSelector((state: RootState) => state.theme);
    const router = useRouter();
    const t = useTranslation();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    useEffect(() => {
        // Configure Google Sign-In when component mounts
        configureGoogleSignIn();
    }, []);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert(t('Lỗi'), t('Vui lòng nhập đầy đủ thông tin'));
            return;
        }

        setIsLoading(true);
        try {
            const result = await dispatch(login({ username, password })).unwrap();

            if (result) {
                Alert.alert('Thành công', 'Đăng nhập thành công');

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

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            // Sign in with Google
            const googleData = await signInWithGoogle();
            
            // Send Google data to backend
            const result = await dispatch(googleLogin(googleData)).unwrap();

            if (result) {
                Alert.alert('Thành công', 'Đăng nhập Google thành công');
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Đăng nhập Google thất bại';
            Alert.alert(t('Đăng nhập thất bại'), errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (error) {
            Alert.alert(t('Lỗi'), error);
            dispatch(clearError());
        }
    }, [error, dispatch, t]);

    useEffect(() => {
        GoogleSignin.configure({
            iosClientId: 
            "20028934029-fjbtgpeo0uirh0nu7vnob3k8n45istj3.apps.googleusercontent.com",
            webClientId:
            "20028934029-jdc4pr5q7e92f0jhij7mjrflughq8j5v.apps.googleusercontent.com",
            profileImageSize: 120,
        })
    }, [])

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: currentTheme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
                    <Text style={[styles.title, { color: '#fff' }]}>{t('Movie Ticket Booking')}</Text>
                    <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.9)' }]}>{t('Đăng nhập để tiếp tục')}</Text>
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
                            style={[styles.input, { backgroundColor: currentTheme.card, color: currentTheme.text, borderColor: currentTheme.subtext }]}
                            value={username}
                            onChangeText={setUsername}
                            placeholder={t('Nhập tên đăng nhập')}
                            placeholderTextColor={currentTheme.subtext}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={[styles.label, { color: currentTheme.text }]}>{t('Mật khẩu')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: currentTheme.card, color: currentTheme.text, borderColor: currentTheme.subtext }]}
                            value={password}
                            onChangeText={setPassword}
                            placeholder={t('Nhập mật khẩu')}
                            placeholderTextColor={currentTheme.subtext}
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
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>
                                {t('Đăng nhập')}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
                        <Text style={[styles.dividerText, { color: currentTheme.subtext }]}>
                            {t('Hoặc')}
                        </Text>
                        <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
                    </View>

                    <TouchableOpacity
                        style={[styles.googleButton, { borderColor: currentTheme.border }, isLoading && styles.disabledButton]}
                        onPress={handleGoogleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.googleButtonText}>
                            {t('Đăng nhập với Google')}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={[styles.dividerLine, { backgroundColor: currentTheme.subtext }]} />
                        <Text style={[styles.dividerText, { color: currentTheme.subtext }]}>{t('hoặc')}</Text>
                        <View style={[styles.dividerLine, { backgroundColor: currentTheme.subtext }]} />
                    </View>

                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={handleGoogleLogin}
                    >
                        <View style={styles.googleButtonContent}>
                            <Image
                                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                                style={styles.googleLogo}
                            />
                            <Text style={styles.googleButtonText}>{t('Đăng nhập với Google')}</Text>
                        </View>
                    </TouchableOpacity>
                    <Text
                        style={[styles.registerPrompt, { color: currentTheme.text }]}
                    >{t('Bạn chưa có tài khoản')}
                        <TouchableOpacity
                            onPress={() => router.push('/register')}
                        >
                            <Text style={{ color: currentTheme.primary }}> {t('Đăng ký ngay')}</Text>
                        </TouchableOpacity>
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push('/forgot-password')}
                        style={{ marginTop: 10, alignSelf: 'center' }}
                    >
                        <Text style={{ color: currentTheme.primary }}> {t('Quên mật khẩu?')}</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.footer, { backgroundColor: currentTheme.card }]}>
                    <Text style={[styles.footerText, { color: currentTheme.text }]}>
                        {t('Demo accounts:')}
                    </Text>
                    <Text style={[styles.demoText, { color: currentTheme.subtext }]}>{t('Admin:')} admin / password</Text>
                    <Text style={[styles.demoText, { color: currentTheme.subtext }]}>{t('Staff:')} staff1 / password</Text>
                    <Text style={[styles.demoText, { color: currentTheme.subtext }]}>{t('Customer:')} customer1 / password</Text>
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
        paddingTop: 60,
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
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 10,
        fontSize: 14,
        fontWeight: '500',
    },
    googleButton: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#dadce0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    googleButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleLogo: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    googleButtonText: {
        color: '#3c4043',
        fontSize: 16,
        fontWeight: '500',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    divider: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 10,
        fontSize: 14,
    },
    googleButton: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        marginTop: 10,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4285F4',
    },
});
