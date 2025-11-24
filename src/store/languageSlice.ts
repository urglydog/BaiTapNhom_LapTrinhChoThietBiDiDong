import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LanguageState {
  language: 'vi' | 'en';
}

const initialState: LanguageState = {
  language: 'vi',
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<'vi' | 'en'>) => {
      state.language = action.payload;
    },
    toggleLanguage: (state) => {
      state.language = state.language === 'vi' ? 'en' : 'vi';
    },
  },
});

export const { setLanguage, toggleLanguage } = languageSlice.actions;
export default languageSlice.reducer;

