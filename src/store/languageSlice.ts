import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type LanguageState = {
  language: 'en' | 'vi';
};

const initialState: LanguageState = {
  language: 'vi',
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<'en' | 'vi'>) => {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
