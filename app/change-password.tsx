import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../src/services/authService';
import { RootState } from '../src/store';
import { useRouter } from 'expo-router';
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';

export default function ChangePasswordScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { theme } = useSelector((state: RootState) => state.theme);
  const t = useTranslation();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {};

    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = t('Mật khẩu cũ không được để trống');
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = t('Mật khẩu mới không được để trống');
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = t('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('Xác nhận mật khẩu không được để trống');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('Mật khẩu xác nhận không khớp');
    }

    if (formData.oldPassword === formData.newPassword) {
      newErrors.newPassword = t('Mật khẩu mới phải khác mật khẩu cũ');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      await authService.changePassword(formData.oldPassword, formData.newPassword);
      Alert.alert(
        t('Thành công'),
        t('Mật khẩu đã được thay đổi thành công!'),
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form và quay về profile
              setFormData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
              router.push('/(tabs)/profile');
            }
          }
        ]
      );
    } catch (error: any) {
      setErrorMessage(error.message || t('Không thể thay đổi mật khẩu'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentTheme.text }]}>Movie Ticket Booking</Text>
          <Text style={[styles.subtitle, { color: currentTheme.subtext }]}>{t('Đổi mật khẩu')}</Text>
        </View>

        <View style={[styles.form, { backgroundColor: currentTheme.card }]}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: currentTheme.text }]}>{t('Mật khẩu cũ')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: currentTheme.background, color: currentTheme.text }, errors.oldPassword && styles.inputError]}
              placeholder={t('Nhập mật khẩu cũ')}
              value={formData.oldPassword}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, oldPassword: text }));
                if (errors.oldPassword) setErrors(prev => ({ ...prev, oldPassword: undefined }));
              }}
              secureTextEntry
            />
            {errors.oldPassword && <Text style={styles.errorText}>{errors.oldPassword}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: currentTheme.text }]}>{t('Mật khẩu mới')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: currentTheme.background, color: currentTheme.text }, errors.newPassword && styles.inputError]}
              placeholder={t('Nhập mật khẩu mới')}
              value={formData.newPassword}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, newPassword: text }));
                if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: undefined }));
              }}
              secureTextEntry
            />
            {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: currentTheme.text }]}>{t('Xác nhận mật khẩu mới')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: currentTheme.background, color: currentTheme.text }, errors.confirmPassword && styles.inputError]}
              placeholder={t('Nhập lại mật khẩu mới')}
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, confirmPassword: text }));
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }}
              secureTextEntry
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessageText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.primary }, isLoading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.buttonText}>{t('Đang xử lý...')}</Text>
            ) : (
              <Text style={styles.buttonText}>{t('Đổi mật khẩu')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.secondaryButtonText, { color: currentTheme.primary }]}>{t('Hủy')}</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={isLoading}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.loadingOverlay}>
            <View style={[styles.loadingContainer, { backgroundColor: currentTheme.card }]}>
              <ActivityIndicator size="large" color={currentTheme.primary} />
              <Text style={[styles.loadingText, { color: currentTheme.subtext }]}>{t('Đang xử lý...')}</Text>
            </View>
          </View>
        </Modal>
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
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  errorMessageText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});

