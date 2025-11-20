import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import { SendOtpRequest, SendOtpResponse, VerifyOtpRequest, VerifyOtpResponse } from '../types';

interface OtpState {
  otpSent: boolean;
  otpVerified: boolean;
  otpExpiresAt: number | null;
  otpType: 'LOGIN' | 'REGISTER' | 'RESET_PASSWORD' | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OtpState = {
  otpSent: false,
  otpVerified: false,
  otpExpiresAt: null,
  otpType: null,
  isLoading: false,
  error: null,
};

// OTP thunks
export const sendOtp = createAsyncThunk(
  'otp/sendOtp',
  async (request: SendOtpRequest, { rejectWithValue }) => {
    try {
      const response = await authService.sendOtp(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'otp/verifyOtp',
  async (request: VerifyOtpRequest, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOtp(request);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

export const loginWithOtp = createAsyncThunk(
  'otp/loginWithOtp',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authService.loginWithOtp(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login with OTP failed');
    }
  }
);

const otpSlice = createSlice({
  name: 'otp',
  initialState,
  reducers: {
    clearOtp: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.otpExpiresAt = null;
      state.otpType = null;
      state.error = null;
    },
    clearOtpError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.otpType = action.meta.arg.type;
        state.otpExpiresAt = action.payload.expiresIn
          ? Date.now() + (action.payload.expiresIn * 1000)
          : null;
        state.error = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.otpSent = false;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpVerified = true;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.otpVerified = false;
      })
      // Login with OTP
      .addCase(loginWithOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Reset OTP states after successful login
        state.otpSent = false;
        state.otpVerified = false;
        state.otpExpiresAt = null;
        state.otpType = null;
      })
      .addCase(loginWithOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearOtp, clearOtpError } = otpSlice.actions;
export default otpSlice.reducer;