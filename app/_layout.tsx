import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/store';
import { loadStoredAuth }  from '../src/store/authSlice';
import { useAppDispatch, useAppSelector } from '../src/hooks/redux';

export default function RootLayout() {
  return (
    <Provider store={store}>
      {persistor ? (
        <PersistGate loading={null} persistor={persistor}>
          <AppNavigator />
        </PersistGate>
      ) : (
        <AppNavigator />
      )}
    </Provider>
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
    </Stack>
  );
}