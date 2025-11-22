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
import { useAppSelector } from '@/src/hooks/redux';
import { darkTheme, lightTheme } from '@/src/themes';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, otpSent, otpVerified, otpExpiresAt } = useSelector(
    (state: RootState) => state.otp
  );
  const router = useRouter();
  const { theme } = useAppSelector((state) => state.theme);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(currentTheme);

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
          newErrors.email = t('Email is required');
        } else if (!validateEmail(formData.email)) {
          newErrors.email = t('Invalid email');
        }
        break;

      case 'otp':
        if (!formData.otp.trim()) {
          newErrors.otp = t('OTP is required');
        } else if (formData.otp.length !== 6) {
          newErrors.otp = t('OTP must be 6 digits');
        }
        break;

      case 'details':
        if (!formData.fullName.trim()) {
          newErrors.fullName = t('Full name is required');
        }
        if (!formData.phone.trim()) {
          newErrors.phone = t('Phone number is required');
        } else if (!validatePhone(formData.phone)) {
          newErrors.phone = t('Invalid phone number (10-11 digits)');
        }
        if (!formData.username.trim()) {
          newErrors.username = t('Username is required');
        } else if (formData.username.length < 3) {
          newErrors.username = t('Username must be at least 3 characters');
        }
        if (!formData.password.trim()) {
          newErrors.password = t('Password is required');
        } else if (formData.password.length < 6) {
          newErrors.password = t('Password must be at least 6 characters');
        }
        if (!formData.confirmPassword.trim()) {
          newErrors.confirmPassword = t('Confirm password is required');
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = t('Confirm password does not match');
        }
        if (!formData.dateOfBirth.trim()) {
          newErrors.dateOfBirth = t('Date of birth is required');
        } else {
          // Validate date format
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(formData.dateOfBirth)) {
            newErrors.dateOfBirth = t('Date of birth format must be YYYY-MM-DD');
          } else {
            const [year, month, day] = formData.dateOfBirth.split('-').map(Number);
            if (year < 1900 || year > 2010) {
              newErrors.dateOfBirth = t('Year of birth must be between 1900 and 2010');
            } else if (month < 1 || month > 12) {
              newErrors.dateOfBirth = t('Month must be between 01 and 12');
            } else {
              const daysInMonth = new Date(year, month, 0).getDate();
              if (day < 1 || day > daysInMonth) {
                newErrors.dateOfBirth = t('Day must be between 01 and {daysInMonth} for month {month}', { daysInMonth, month });
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
      Alert.alert(t('Success'), t('OTP has been sent to your email'));
    } catch (error: any) {
      Alert.alert(t('Error'), error.message || t('Could not send OTP'));
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
      Alert.alert(t('Success'), t('OTP is valid! Please enter your account information'));
    } catch (error: any) {
      Alert.alert(t('Error'), error || t('Invalid OTP'));
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
      Alert.alert(t('Success'), t('Account registration successful!'), [
        { text: 'OK', onPress: () => {
          // Could navigate to login screen
        }}
      ]);
    } catch (error: any) {
      Alert.alert(t('Error'), error || t('Registration failed'));
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email) return;

    try {
      await dispatch(sendOtp({
        email: formData.email,
        type: 'REGISTER'
      })).unwrap();
      Alert.alert(t('Success'), t('A new OTP has been sent'));
    } catch (error: any) {
      Alert.alert(t('Error'), error.message || t('Could not send OTP'));
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
        onPress={() => router.replace('/login')}
      >
        <Text style={styles.backButtonText}>← {t('Back')}</Text>
      </TouchableOpacity>

      <Text style={styles.formTitle}>{t('Register')}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('Email')}</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder={t('Enter your email')}
          value={formData.email}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, email: text }));
            if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={currentTheme.text}
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
          <Text style={styles.buttonText}>{t('Send OTP')}</Text>
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
        <Text style={styles.backButtonText}>← {t('Back')}</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('OTP Code')}</Text>
        <TextInput
          style={[styles.input, errors.otp && styles.inputError]}
          placeholder={t('Enter 6-digit OTP')}
          value={formData.otp}
          onChangeText={(text) => {
            setFormData(prev => ({ ...prev, otp: text.replace(/[^0-9]/g, '') }));
            if (errors.otp) setErrors(prev => ({ ...prev, otp: undefined }));
          }}
          keyboardType="numeric"
          maxLength={6}
          placeholderTextColor={currentTheme.text}
        />
        {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
      </View>

      {otpExpiresAt && (
        <Text style={styles.countdownText}>
          {t('OTP expires in: ')}{getOtpCountdown()}
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
          <Text style={styles.buttonText}>{t('Verify OTP')}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleResendOtp}
        disabled={isLoading}
      >
        <Text style={styles.secondaryButtonText}>{t('Resend OTP')}</Text>
      </TouchableOpacity>
    </>
  );

  const renderDetailsStep = () => (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep('otp')}
      >
        <Text style={styles.backButtonText}>← {t('Back')}</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('FullName')}</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            placeholder={t('Enter full name')}
            value={formData.fullName}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, fullName: text }));
              if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
            }}
            placeholderTextColor={currentTheme.text}
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Gender')}</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderButton, formData.gender === 'MALE' && styles.genderButtonActive]}
              onPress={() => setFormData(prev => ({ ...prev, gender: 'MALE' }))}
            >
              <Text style={[styles.genderText, formData.gender === 'MALE' && styles.genderTextActive]}>{t('Male')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, formData.gender === 'FEMALE' && styles.genderButtonActive]}
              onPress={() => setFormData(prev => ({ ...prev, gender: 'FEMALE' }))}
            >
              <Text style={[styles.genderText, formData.gender === 'FEMALE' && styles.genderTextActive]}>{t('Female')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('PhoneNumber')}</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder={t('Enter phone number')}
            value={formData.phone}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, phone: text.replace(/[^0-9]/g, '') }));
              if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
            }}
            keyboardType="phone-pad"
            maxLength={11}
            placeholderTextColor={currentTheme.text}
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Username')}</Text>
          <TextInput
            style={[styles.input, errors.username && styles.inputError]}
            placeholder={t('Enter username')}
            value={formData.username}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, username: text }));
              if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
            }}
            autoCapitalize="none"
            placeholderTextColor={currentTheme.text}
          />
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Password')}</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder={t('Enter password')}
            value={formData.password}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, password: text }));
              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
            }}
            secureTextEntry
            placeholderTextColor={currentTheme.text}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Confirm Password')}</Text>
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            placeholder={t('Confirm your password')}
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('DateOfBirth')}</Text>
          <TextInput
            style={[styles.input, errors.dateOfBirth && styles.inputError]}
            placeholder={t('YYYY-MM-DD (e.g., 1990-01-15)')}
            value={formData.dateOfBirth}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, dateOfBirth: text }));
              if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: undefined }));
            }}
            keyboardType="numeric"
            maxLength={10}
            autoCapitalize="none"
            placeholderTextColor={currentTheme.text}
          />
          <Text style={styles.dateHint}>
            {t('Format: YYYY-MM-DD (e.g., 1990-01-15)')}
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
            <Text style={styles.buttonText}>{t('Register')}</Text>
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
          <Text style={styles.title}>{t('Movie Ticket Booking')}</Text>
          <Text style={styles.subtitle}>{t('Create new account')}</Text>
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
            {t('Already have an account? ')}
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.linkText}>{t('Login')}</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>
      {isPageLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={styles.loadingText}>{t('Processing...')}</Text>
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
    borderColor: theme.border,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: theme.background,
  },
  genderButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  genderText: {
    fontSize: 16,
    color: theme.text,
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
    color: theme.text,
  },
  linkText: {
    color: theme.primary,
    fontSize: 14,
  },
  dateHint: {
    fontSize: 12,
    color: theme.text,
    marginTop: 4,
    fontStyle: 'italic',
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
