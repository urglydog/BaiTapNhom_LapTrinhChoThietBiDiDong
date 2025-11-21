import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { User } from '../types';

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  // For forgot password flow
  userForReset: User | null;
  resetStep: 'username' | 'reset' | null;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
  userForReset: null,
  resetStep: null,
};

// Async thunks
export const getUsers = createAsyncThunk(
  'user/getUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUsers();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get users');
    }
  }
);

export const getUser = createAsyncThunk(
  'user/getUser',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await userService.getUser(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

export const getUserByUsername = createAsyncThunk(
  'user/getUserByUsername',
  async (username: string, { rejectWithValue }) => {
    try {
      const response = await userService.getUserByUsername(username);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

export const getUserByEmail = createAsyncThunk(
  'user/getUserByEmail',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await userService.getUserByEmail(email);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Omit<User, 'id'>, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }: { id: number; userData: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(id, userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id: number, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const checkUsername = createAsyncThunk(
  'user/checkUsername',
  async (username: string, { rejectWithValue }) => {
    try {
      const response = await userService.checkUsername(username);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check username');
    }
  }
);

export const checkEmail = createAsyncThunk(
  'user/checkEmail',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await userService.checkEmail(email);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check email');
    }
  }
);

// Forgot password flow
export const getUserForResetPassword = createAsyncThunk(
  'user/getUserForResetPassword',
  async (username: string, { rejectWithValue }) => {
    try {
      const response = await userService.getUserByUsername(username);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Username not found');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async ({ username, newPassword }: { username: string; newPassword: string }, { rejectWithValue }) => {
    try {
      await authService.resetPassword(username, newPassword);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    clearResetFlow: (state) => {
      state.userForReset = null;
      state.resetStep = null;
    },
    setResetStep: (state, action: PayloadAction<'username' | 'reset' | null>) => {
      state.resetStep = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get users
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get user
      .addCase(getUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get user by username
      .addCase(getUserByUsername.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserByUsername.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(getUserByUsername.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get user by email
      .addCase(getUserByEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserByEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(getUserByEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.push(action.payload);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check username
      .addCase(checkUsername.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkUsername.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(checkUsername.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check email
      .addCase(checkEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(checkEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get user for reset password
      .addCase(getUserForResetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserForResetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userForReset = action.payload;
        state.resetStep = 'reset';
        state.error = null;
      })
      .addCase(getUserForResetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userForReset = null;
        state.resetStep = null;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentUser, clearResetFlow, setResetStep } = userSlice.actions;
export default userSlice.reducer;