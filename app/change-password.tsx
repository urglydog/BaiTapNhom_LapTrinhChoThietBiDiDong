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
import { useAppSelector } from '@/src/hooks/redux';
import { darkTheme, lightTheme } from '@/src/themes';
import { useTranslation } from 'react-i18next';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const router = useRouter();
  const { theme } = useAppSelector((state) => state.theme);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(currentTheme);

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
      newErrors.oldPassword = t('Old password is required');
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = t('New password is required');
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = t('New password must be at least 6 characters');
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('Confirm new password is required');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('Confirm new password does not match');
    }

    if (formData.oldPassword === formData.newPassword) {
      newErrors.newPassword = t('New password must be different from old password');
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
        t('Success'),
        t('Password has been changed successfully!'),
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and go back to profile
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
      setErrorMessage(error.message || t('Could not change password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Movie Ticket Booking</Text>
          <Text style={styles.subtitle}>Đổi mật khẩu</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('Old Password')}</Text>
            <TextInput
              style={[styles.input, errors.oldPassword && styles.inputError]}
              placeholder={t('Enter old password')}
              value={formData.oldPassword}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, oldPassword: text }));
                if (errors.oldPassword) setErrors(prev => ({ ...prev, oldPassword: undefined }));
              }}
              secureTextEntry
              placeholderTextColor={currentTheme.text}
            />
            {errors.oldPassword && <Text style={styles.errorText}>{errors.oldPassword}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('New Password')}</Text>
            <TextInput
              style={[styles.input, errors.newPassword && styles.inputError]}
              placeholder={t('Enter new password')}
              value={formData.newPassword}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, newPassword: text }));
                if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: undefined }));
              }}
              secureTextEntry
              placeholderTextColor={currentTheme.text}
            />
            {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('Confirm New Password')}</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder={t('Confirm your new password')}
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData(prev => ({ ...prev, confirmPassword: text }));
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }}
              secureTextEntry
              placeholderTextColor={currentTheme.text}
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessageText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.buttonText}>{t('Processing...')}</Text>
            ) : (
              <Text style={styles.buttonText}>{t('Change Password')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>{t('Cancel')}</Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={isLoading}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={currentTheme.primary} />
              <Text style={styles.loadingText}>Đang xử lý...</Text>
            </View>
          </View>
        </Modal>
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
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: theme.primary,
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
    color: theme.primary,
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
    backgroundColor: theme.card,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
});