import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store';
import { loadStoredAuth }  from '../src/store/authSlice';
import { useAppDispatch, useAppSelector } from '../src/hooks/redux';
import { View } from 'react-native';
import { darkTheme, lightTheme } from '@/src/themes';

import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n';

export default function RootLayout() {
  return (
    <Provider store={store}>
      {persistor ? (
        <PersistGate loading={null} persistor={persistor}>
          <ThemedApp />
        </PersistGate>
      ) : (
        <ThemedApp />
      )}
    </Provider>
  );
}

function ThemedApp() {
  const { theme } = useAppSelector((state) => state.theme);
  const { language } = useAppSelector((state) => state.language);
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return (
    <I18nextProvider i18n={i18n}>
      <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
        <AppNavigator />
      </View>
    </I18nextProvider>
  );
}

function AppNavigator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadStoredAuth());
  }, [dispatch]);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="movie-detail" />
      <Stack.Screen name="booking" />
      <Stack.Screen name="cinemas" />
      <Stack.Screen name="favourites" />
      <Stack.Screen name="promotions" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}