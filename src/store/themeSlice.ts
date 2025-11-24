import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
}

const initialState: ThemeState = {
  theme: 'light',
  language: 'vi',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setLanguage: (state, action: PayloadAction<'vi' | 'en'>) => {
      state.language = action.payload;
    },
    toggleLanguage: (state) => {
      state.language = state.language === 'vi' ? 'en' : 'vi';
    },
  },
});

export const { setTheme, toggleTheme, setLanguage, toggleLanguage } = themeSlice.actions;
export default themeSlice.reducer;

