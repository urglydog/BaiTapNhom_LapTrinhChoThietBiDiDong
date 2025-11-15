import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { login, clearError } from '../src/store/authSlice';
import { navigate } from 'expo-router/build/global-state/routing';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const { error } = useSelector((state: RootState) => state.auth);

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setIsLoading(true);
        try {
            const result = await dispatch(login({ username, password })).unwrap();

            if (result) {
                navigate('/(tabs)/profile');
            }
        } catch (error) {
            Alert.alert('Đăng nhập thất bại', error as string);
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
                    <Text style={styles.title}>Movie Ticket Booking</Text>
                    <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Tên đăng nhập</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Nhập tên đăng nhập"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mật khẩu</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Nhập mật khẩu"
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    form: {
        backgroundColor: 'white',
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
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    loginButton: {
        backgroundColor: '#007AFF',
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
        color: '#666',
        marginBottom: 8,
    },
    demoText: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
});
