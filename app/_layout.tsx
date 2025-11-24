import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor, RootState } from '../src/store';
import { loadStoredAuth } from '../src/store/authSlice';
import { useAppDispatch, useAppSelector } from '../src/hooks/redux';
import { ThemeProvider } from 'styled-components/native';
import { lightTheme, darkTheme } from '../src/themes';

export default function RootLayout() {
  return (
    <Provider store={store}>
      {persistor ? (
        <PersistGate loading={null} persistor={persistor}>
          <Main />
        </PersistGate>
      ) : (
        <Main />
      )}
    </Provider>
  );
}

function Main() {
  const { theme } = useSelector((state: RootState) => state.theme);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <AppNavigator />
    </ThemeProvider>
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
      <Stack.Screen name="booking-history" />
      <Stack.Screen name="watched-movies" />
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