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

type Step = 'email' | 'otp' | 'newPassword' | 'success';

export default function ForgotPassword() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, error, otpExpiresAt } = useSelector((state: RootState) => state.otp);

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
          newErrors.email = 'Vui lòng nhập email';
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Email không hợp lệ';
        }
        break;
      case 'otp':
        if (!formData.otp.trim()) {
          newErrors.otp = 'Vui lòng nhập mã OTP';
        } else if (formData.otp.length !== 6) {
          newErrors.otp = 'Mã OTP phải có 6 chữ số';
        }
        break;
      case 'newPassword':
        if (!formData.newPassword.trim()) {
          newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (formData.newPassword.length < 6) {
          newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        if (!formData.confirmPassword.trim()) {
          newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.newPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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
      Alert.alert('Thành công', 'OTP đã được gửi đến email của bạn');
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể gửi OTP');
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
      Alert.alert('Thành công', 'OTP hợp lệ! Vui lòng nhập mật khẩu mới');
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'OTP không hợp lệ');
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
      Alert.alert('Lỗi', error?.message || 'Đặt lại mật khẩu thất bại');
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
        <Text style={styles.backButtonText}>← Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Quên mật khẩu</Text>
      <Text style={styles.subtitle}>Nhập email của bạn để nhận mã OTP</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Nhập email của bạn"
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
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, (isLoading || isSubmitting) && styles.buttonDisabled]}
        onPress={handleSendOtp}
        disabled={isLoading || isSubmitting}
      >
        <Text style={styles.buttonText}>Gửi OTP</Text>
      </TouchableOpacity>

      <View style={styles.linksContainer}>
        <View style={styles.linksRow}>
          <TouchableOpacity
            onPress={() => router.push('/login')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Đăng nhập</Text>
          </TouchableOpacity>

          <Text style={styles.linkSeparator}>|</Text>

          <TouchableOpacity
            onPress={() => router.push('/register' as any)}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Đăng ký</Text>
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
        <Text style={styles.backButtonText}>← Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Xác thực OTP</Text>
      <Text style={styles.subtitle}>Nhập mã OTP đã được gửi đến email của bạn</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mã OTP</Text>
        <TextInput
          style={[styles.input, errors.otp && styles.inputError]}
          placeholder="Nhập 6 chữ số OTP"
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
        />
        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
      </View>

      {otpExpiresAt && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>
            OTP hết hạn sau: {getOtpCountdown()}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, (isLoading || isSubmitting) && styles.buttonDisabled]}
        onPress={handleVerifyOtp}
        disabled={isLoading || isSubmitting}
      >
        <Text style={styles.buttonText}>Xác thực OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendOtp}
        disabled={isLoading || isSubmitting}
      >
        <Text style={[styles.resendText, (isLoading || isSubmitting) && styles.resendTextDisabled]}>
          Gửi lại OTP
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
        <Text style={styles.backButtonText}>← Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Đặt mật khẩu mới</Text>
      <Text style={styles.subtitle}>Nhập mật khẩu mới cho tài khoản của bạn</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu mới</Text>
        <TextInput
          style={[styles.input, errors.newPassword && styles.inputError]}
          placeholder="Nhập mật khẩu mới"
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
        />
        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Xác nhận mật khẩu</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Nhập lại mật khẩu mới"
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
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, (isLoading || isSubmitting) && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={isLoading || isSubmitting}
      >
        <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successIconContainer}>
        <Text style={styles.successIcon}>✓</Text>
      </View>

      <Text style={styles.title}>Thành công!</Text>
      <Text style={styles.subtitle}>Mật khẩu của bạn đã được đặt lại thành công</Text>

      <View style={styles.successMessage}>
        <Text style={styles.successText}>
          Bạn có thể sử dụng mật khẩu mới để đăng nhập vào tài khoản của mình.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.successButton}
        onPress={() => {
          router.replace('/login');
        }}
      >
        <Text style={styles.successButtonText}>Quay lại đăng nhập</Text>
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
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang xử lý...</Text>
        </View>
      )}
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
  stepContainer: {
    backgroundColor: 'white',
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
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
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
    backgroundColor: '#007AFF',
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
    color: '#007AFF',
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
    color: '#666',
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
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  successText: {
    color: '#2E7D32',
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
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    color: '#666',
    fontSize: 16,
    marginHorizontal: 8,
  },
  linkButton: {
    marginVertical: 4,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
