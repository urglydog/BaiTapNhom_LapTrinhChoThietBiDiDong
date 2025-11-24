import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

import authReducer from './authSlice';
import movieReducer from './movieSlice';
import bookingReducer from './bookingSlice';
import otpReducer from './otpSlice';
import themeReducer from './themeSlice';
import languageReducer from './languageSlice';

// Chỉ sử dụng persist cho mobile, không dùng cho web
const persistConfig = {
  key: 'root',
  storage: storage,
  whitelist: ['auth', 'theme', 'language'], // Persist auth, theme và language
};

const rootReducer = combineReducers({
  auth: authReducer,
  movie: movieReducer,
  booking: bookingReducer,
  otp: otpReducer,
  theme: themeReducer,
  language: languageReducer,
});

// Chỉ persist cho mobile, web dùng reducer thường
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
