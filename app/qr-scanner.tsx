import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useTranslation } from '../src/localization';
import { lightTheme, darkTheme } from '../src/themes';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { bookingService } from '../src/services/bookingService';
import * as Linking from 'expo-linking';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme } = useSelector((state: RootState) => state.theme);
  const t = useTranslation();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isLoading) return;
    
    setScanned(true);
    setIsLoading(true);

    try {
      // Handle QR code data - could be deep link URL or JSON
      let bookingId: number | null = null;
      let bookingCode: string | null = null;

      try {
        // Check if it's a deep link URL
        if (data.startsWith('movieappfrontend://') || data.startsWith('http://') || data.startsWith('https://')) {
          try {
            const url = new URL(data);
            const params = new URLSearchParams(url.search);
            bookingId = params.get('bookingId') ? parseInt(params.get('bookingId')!) : null;
            bookingCode = params.get('bookingCode') || null;
            
            // Also check pathname for bookingId
            if (!bookingId) {
              const pathMatch = url.pathname.match(/\/ticket-detail\/(\d+)/);
              if (pathMatch) {
                bookingId = parseInt(pathMatch[1]);
              }
            }
          } catch (urlError) {
            // If URL parsing fails, try to extract from string
            const bookingIdMatch = data.match(/bookingId[=:](\d+)/i) || 
                                   data.match(/booking[=:](\d+)/i);
            if (bookingIdMatch) {
              bookingId = parseInt(bookingIdMatch[1]);
            }
          }
        } else {
          // Try to parse as JSON
          try {
            const qrData = JSON.parse(data);
            bookingId = qrData.bookingId ? parseInt(qrData.bookingId) : null;
            bookingCode = qrData.bookingCode || null;
          } catch (parseError) {
            // If not JSON, try to extract booking ID from string
            const bookingIdMatch = data.match(/bookingId[=:](\d+)/i) || 
                                   data.match(/booking[=:](\d+)/i) ||
                                   data.match(/#(\d+)/);
            
            if (bookingIdMatch) {
              bookingId = parseInt(bookingIdMatch[1]);
            } else {
              throw new Error('Invalid QR code format');
            }
          }
        }

        // Navigate to ticket detail
        if (bookingId) {
          router.push({
            pathname: '/ticket-detail',
            params: { 
              bookingId: bookingId.toString(),
              bookingCode: bookingCode || undefined
            }
          } as any);
        } else if (bookingCode) {
          // Try to find booking by code
          try {
            const booking = await bookingService.getBookingByCode(bookingCode);
            router.push({
              pathname: '/ticket-detail',
              params: { 
                bookingId: booking.id.toString()
              }
            } as any);
          } catch (error) {
            Alert.alert(
              t('Lỗi'),
              t('Không tìm thấy vé với mã: {code}', { code: bookingCode })
            );
            setScanned(false);
          }
        } else {
          throw new Error('Invalid QR code data');
        }
      } catch (error: any) {
        console.error('Error processing QR code:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Error scanning QR code:', error);
      Alert.alert(
        t('Lỗi'),
        t('Không thể đọc mã QR. Vui lòng thử lại.'),
        [
          {
            text: t('Thử lại'),
            onPress: () => setScanned(false),
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centerContainer, { backgroundColor: currentTheme.background }]}>
        <Text style={[styles.message, { color: currentTheme.text }]}>
          {t('Cần quyền truy cập camera để quét mã QR')}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentTheme.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>{t('Cấp quyền')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: currentTheme.primary }]}>
            ← {t('Quay lại')}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.text }]}>
          {t('Quét mã QR vé')}
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={[styles.instruction, { color: '#fff' }]}>
              {t('Đưa mã QR vào khung để quét')}
            </Text>
          </View>
        </CameraView>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.text }]}>
            {t('Đang xử lý...')}
          </Text>
        </View>
      )}

      {scanned && !isLoading && (
        <TouchableOpacity
          style={[styles.scanAgainButton, { backgroundColor: currentTheme.primary }]}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.scanAgainButtonText}>
            {t('Quét lại')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  instruction: {
    marginTop: 40,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scanAgainButton: {
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanAgainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

