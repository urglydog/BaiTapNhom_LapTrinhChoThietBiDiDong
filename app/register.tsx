import { navigate } from 'expo-router/build/global-state/routing';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { authService } from '../src/services/authService';
import { RootState, AppDispatch } from '../src/store';
import { sendOtp, verifyOtp } from '../src/store/otpSlice';
import { RegisterRequest } from '../src/types';
import { useRouter } from 'expo-router';

type RegisterStep = 'email' | 'otp' | 'details';

interface RegisterFormData {
  email: string;
  otp: string;
  fullName: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
}

export default function RegisterScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, otpSent, otpVerified, otpExpiresAt } = useSelector(
    (state: RootState) => state.otp
  );
  const router = useRouter();

  const isPageLoading = isLoading;

  const [step, setStep] = useState<RegisterStep>('email');
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    otp: '',
    fullName: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: 'MALE',
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const validateStep = (currentStep: RegisterStep): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    switch (currentStep) {
      case 'email':
        if (!formData.email.trim()) {
          newErrors.email = 'Email không được để trống';
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Email không hợp lệ';
        }
        break;

      case 'otp':
        if (!formData.otp.trim()) {
          newErrors.otp = 'OTP không được để trống';
        } else if (formData.otp.length !== 6) {
          newErrors.otp = 'OTP phải có 6 chữ số';
        }
        break;

      case 'details':
        if (!formData.fullName.trim()) {
          newErrors.fullName = 'Họ tên không được để trống';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Số điện thoại không được để trống';
        } else if (!validatePhone(formData.phone)) {
          newErrors.phone = 'Số điện thoại không hợp lệ (10-11 chữ số)';
        }
        if (!formData.username.trim()) {
          newErrors.username = 'Tên đăng nhập không được để trống';
        } else if (formData.username.length < 3) {
          newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
        }
        if (!formData.password.trim()) {
          newErrors.password = 'Mật khẩu không được để trống';
        } else if (formData.password.length < 6) {
          newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        if (!formData.confirmPassword.trim()) {
          newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }
        if (!formData.dateOfBirth.trim()) {
          newErrors.dateOfBirth = 'Ngày sinh không được để trống';
        } else {
          // Validate date format
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(formData.dateOfBirth)) {
            newErrors.dateOfBirth = 'Định dạng ngày sinh phải là YYYY-MM-DD';
          } else {
            const [year, month, day] = formData.dateOfBirth.split('-').map(Number);
            if (year < 1900 || year > 2010) {
              newErrors.dateOfBirth = 'Năm sinh phải từ 1900 đến 2010';
            } else if (month < 1 || month > 12) {
              newErrors.dateOfBirth = 'Tháng phải từ 01 đến 12';
            } else {
              const daysInMonth = new Date(year, month, 0).getDate();
              if (day < 1 || day > daysInMonth) {
                newErrors.dateOfBirth = `Ngày phải từ 01 đến ${daysInMonth} cho tháng ${month}`;
              }
            }
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateStep('email')) return;

    try {
      await dispatch(sendOtp({
        email: formData.email,
        type: 'REGISTER'
      })).unwrap();
      setStep('otp');
      Alert.alert('Thành công', 'OTP đã được gửi đến email của bạn');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateStep('otp')) return;

    try {
      // @ts-ignore
      await dispatch(verifyOtp({
        email: formData.email,
        otp: formData.otp,
        type: 'REGISTER'
      })).unwrap();

      setStep('details');
      Alert.alert('Thành công', 'OTP hợp lệ! Vui lòng nhập thông tin tài khoản');
    } catch (error: any) {
      Alert.alert('Lỗi', error || 'OTP không hợp lệ');
    }
  };

  const handleRegister = async () => {
    if (!validateStep('details')) return;

    try {
      const userData: RegisterRequest = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || '1990-01-01', // Default if empty
        gender: formData.gender,
      };

      await authService.register(userData);
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!', [
        { text: 'OK', onPress: () => {
          router.replace('/login');
        }}
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error || 'Đăng ký thất bại');
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email) return;

    try {
      await dispatch(sendOtp({
        email: formData.email,
        type: 'REGISTER'
      })).unwrap();
      Alert.alert('Thành công', 'OTP mới đã được gửi');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi OTP');
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
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace('/login' as any)}
      >
        <Text style={styles.backButtonText}>← Quay lại</Text>
      </TouchableOpacity>

      <Text style={styles.formTitle}>Đăng ký</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Nhập email của bạn"
          value={formData.email}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, email: text }));
            if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSendOtp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Gửi OTP</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderOtpStep = () => (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep('email')}
      >
        <Text style={styles.backButtonText}>← Quay lại</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mã OTP</Text>
        <TextInput
          style={[styles.input, errors.otp && styles.inputError]}
          placeholder="Nhập 6 chữ số OTP"
          value={formData.otp}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, otp: text.replace(/[^0-9]/g, '') }));
            if (errors.otp) setErrors(prev => ({ ...prev, otp: undefined }));
          }}
          keyboardType="numeric"
          maxLength={6}
        />
        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
      </View>

      {otpExpiresAt && (
        <Text style={styles.countdownText}>
          OTP hết hạn sau: {getOtpCountdown()}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleVerifyOtp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Xác thực OTP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleResendOtp}
        disabled={isLoading}
      >
        <Text style={styles.secondaryButtonText}>Gửi lại OTP</Text>
      </TouchableOpacity>
    </>
  );

  const renderDetailsStep = () => (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep('otp')}
      >
        <Text style={styles.backButtonText}>← Quay lại</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            placeholder="Nhập họ và tên"
            value={formData.fullName}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, fullName: text }));
              if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
            }}
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Giới tính</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderButton, formData.gender === 'MALE' && styles.genderButtonActive]}
              onPress={() => setFormData(prev => ({ ...prev, gender: 'MALE' }))}
            >
              <Text style={[styles.genderText, formData.gender === 'MALE' && styles.genderTextActive]}>Nam</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, formData.gender === 'FEMALE' && styles.genderButtonActive]}
              onPress={() => setFormData(prev => ({ ...prev, gender: 'FEMALE' }))}
            >
              <Text style={[styles.genderText, formData.gender === 'FEMALE' && styles.genderTextActive]}>Nữ</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="Nhập số điện thoại"
            value={formData.phone}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, phone: text.replace(/[^0-9]/g, '') }));
              if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
            }}
            keyboardType="phone-pad"
            maxLength={11}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tên đăng nhập</Text>
          <TextInput
            style={[styles.input, errors.username && styles.inputError]}
            placeholder="Nhập tên đăng nhập"
            value={formData.username}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, username: text }));
              if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
            }}
            autoCapitalize="none"
          />
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, password: text }));
              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
            }}
            secureTextEntry
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Xác nhận mật khẩu</Text>
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, confirmPassword: text }));
              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
            }}
            secureTextEntry
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ngày sinh</Text>
          <TextInput
            style={[styles.input, errors.dateOfBirth && styles.inputError]}
            placeholder="YYYY-MM-DD (ví dụ: 1990-01-15)"
            value={formData.dateOfBirth}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, dateOfBirth: text }));
              if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: undefined }));
            }}
            keyboardType="numeric"
            maxLength={10}
            autoCapitalize="none"
          />
          <Text style={styles.dateHint}>
            Định dạng: YYYY-MM-DD (ví dụ: 1990-01-15)
          </Text>
          {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Movie Ticket Booking</Text>
          <Text style={styles.subtitle}>Đăng ký tài khoản mới</Text>
        </View>

        <View style={styles.form}>
          {step === 'email' && renderEmailStep()}
          {step === 'otp' && renderOtpStep()}
          {step === 'details' && renderDetailsStep()}

          {error && (
            <Text style={styles.globalErrorText}>{error}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Đã có tài khoản?
            <TouchableOpacity onPress={() => router.replace('/login' as any)}>
              <Text style={styles.linkText}> Đăng nhập</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>
      {isPageLoading && (
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
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007AFF',
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
    color: '#007AFF',
    fontSize: 16,
  },
  countdownText: {
    textAlign: 'center',
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 10,
  },
  globalErrorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#f9f9f9',
  },
  genderButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderText: {
    fontSize: 16,
    color: '#666',
  },
  genderTextActive: {
    color: '#fff',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  dateHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
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
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
});

