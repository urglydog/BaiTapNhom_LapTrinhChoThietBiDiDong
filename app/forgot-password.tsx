import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../src/store';
import { sendOtp, verifyOtp } from '../src/store/otpSlice';
import { authService } from '../src/services/authService';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/src/hooks/redux';
import { darkTheme, lightTheme } from '@/src/themes';
import { useTranslation } from 'react-i18next';

type Step = 'email' | 'otp' | 'newPassword' | 'success';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error, otpExpiresAt } = useSelector((state: RootState) => state.otp);
  const { theme } = useAppSelector((state) => state.theme);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(currentTheme);

  const [step, setStep] = useState<Step>('email');
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep = (currentStep: Step): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 'email':
        if (!formData.email.trim()) {
          newErrors.email = t('Please enter your email');
        } else if (!validateEmail(formData.email)) {
          newErrors.email = t('Invalid email');
        }
        break;
      case 'otp':
        if (!formData.otp.trim()) {
          newErrors.otp = t('Please enter the OTP code');
        } else if (formData.otp.length !== 6) {
          newErrors.otp = t('OTP code must be 6 digits');
        }
        break;
      case 'newPassword':
        if (!formData.newPassword.trim()) {
          newErrors.newPassword = t('Please enter a new password');
        } else if (formData.newPassword.length < 6) {
          newErrors.newPassword = t('Password must be at least 6 characters');
        }
        if (!formData.confirmPassword.trim()) {
          newErrors.confirmPassword = t('Please confirm your password');
        } else if (formData.newPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = t('Confirm password does not match');
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateStep('email')) return;

    setIsSubmitting(true);
    try {
      await dispatch(sendOtp({
        email: formData.email,
        type: 'RESET_PASSWORD'
      })).unwrap();
      setStep('otp');
      Alert.alert(t('Success'), t('OTP has been sent to your email'));
    } catch (error: any) {
      Alert.alert(t('Error'), error?.message || t('Could not send OTP'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateStep('otp')) return;

    setIsSubmitting(true);
    try {
      await dispatch(verifyOtp({
        email: formData.email,
        otp: formData.otp,
        type: 'RESET_PASSWORD'
      })).unwrap();

      setStep('newPassword');
      Alert.alert(t('Success'), t('OTP is valid! Please enter your new password'));
    } catch (error: any) {
      Alert.alert(t('Error'), error?.message || t('Invalid OTP'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateStep('newPassword')) return;

    setIsSubmitting(true);
    try {
      await authService.resetPasswordByEmail(formData.email, formData.newPassword);
      setStep('success');
    } catch (error: any) {
      Alert.alert(t('Error'), error?.message || t('Failed to reset password'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true);
    try {
      await dispatch(sendOtp({
        email: formData.email,
        type: 'RESET_PASSWORD'
      })).unwrap();
      Alert.alert('Thành công', 'OTP mới đã được gửi');
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể gửi OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOtpCountdown = () => {
    if (!otpExpiresAt) return null;
    const remaining = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderEmailStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/login')}
      >
        <Text style={styles.backButtonText}>← {t('Back')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{t('Forgot password?')}</Text>
      <Text style={styles.subtitle}>{t('Enter your email to receive an OTP code')}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('Email')}</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder={t('Enter your email')}
          value={formData.email}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, email: text }));
            if (errors.email) setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.email;
              return newErrors;
            });
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={currentTheme.text}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, (isLoading || isSubmitting) && styles.buttonDisabled]}
        onPress={handleSendOtp}
        disabled={isLoading || isSubmitting}
      >
        <Text style={styles.buttonText}>{t('Send OTP')}</Text>
      </TouchableOpacity>

      <View style={styles.linksContainer}>
        <View style={styles.linksRow}>
          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>{t('Login')}</Text>
          </TouchableOpacity>

          <Text style={styles.linkSeparator}>|</Text>

          <TouchableOpacity
            onPress={() => router.push('/register')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>{t('Register')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderOtpStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep('email')}
      >
        <Text style={styles.backButtonText}>← {t('Back')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{t('Verify OTP')}</Text>
      <Text style={styles.subtitle}>{t('Enter the OTP code sent to your email')}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('OTP Code')}</Text>
        <TextInput
          style={[styles.input, errors.otp && styles.inputError]}
          placeholder={t('Enter 6-digit OTP')}
          value={formData.otp}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, otp: text }));
            if (errors.otp) setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.otp;
              return newErrors;
            });
          }}
          keyboardType="numeric"
          maxLength={6}
          placeholderTextColor={currentTheme.text}
        />
        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
      </View>

      {otpExpiresAt && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>
            {t('OTP expires in: ')}{getOtpCountdown()}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, (isLoading || isSubmitting) && styles.buttonDisabled]}
        onPress={handleVerifyOtp}
        disabled={isLoading || isSubmitting}
      >
        <Text style={styles.buttonText}>{t('Verify OTP')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendOtp}
        disabled={isLoading || isSubmitting}
      >
        <Text style={[styles.resendText, (isLoading || isSubmitting) && styles.resendTextDisabled]}>
          {t('Resend OTP')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderNewPasswordStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep('otp')}
      >
        <Text style={styles.backButtonText}>← {t('Back')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{t('Set new password')}</Text>
      <Text style={styles.subtitle}>{t('Enter a new password for your account')}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('New Password')}</Text>
        <TextInput
          style={[styles.input, errors.newPassword && styles.inputError]}
          placeholder={t('Enter new password')}
          value={formData.newPassword}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, newPassword: text }));
            if (errors.newPassword) setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.newPassword;
              return newErrors;
            });
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
            if (errors.confirmPassword) setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.confirmPassword;
              return newErrors;
            });
          }}
          secureTextEntry
          placeholderTextColor={currentTheme.text}
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, (isLoading || isSubmitting) && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={isLoading || isSubmitting}
      >
        <Text style={styles.buttonText}>{t('Reset Password')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successIconContainer}>
        <Text style={styles.successIcon}>✓</Text>
      </View>

      <Text style={styles.title}>{t('Success!')}</Text>
      <Text style={styles.subtitle}>{t('Your password has been reset successfully')}</Text>

      <View style={styles.successMessage}>
        <Text style={styles.successText}>
          {t('You can use your new password to log in to your account.')}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.successButton}
        onPress={() => {
          router.replace('/login');
        }}
      >
        <Text style={styles.successButtonText}>{t('Back to Login')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {step === 'email' && renderEmailStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'newPassword' && renderNewPasswordStep()}
        {step === 'success' && renderSuccessStep()}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {(isLoading || isSubmitting) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={styles.loadingText}>Đang xử lý...</Text>
        </View>
      )}
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
  stepContainer: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
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
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
  },
  resendText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: '#ccc',
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownText: {
    color: theme.text,
    fontSize: 14,
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 64,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  successMessage: {
    backgroundColor: theme.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  successText: {
    color: theme.text,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  successButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  successButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.text,
  },
  linksContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkSeparator: {
    color: theme.text,
    fontSize: 16,
    marginHorizontal: 8,
  },
  linkButton: {
    marginVertical: 4,
  },
  linkText: {
    color: theme.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
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
});
