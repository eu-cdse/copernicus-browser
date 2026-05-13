import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LanguageState {
  selectedLanguage: string | null;
}

const initialState: LanguageState = {
  selectedLanguage: null,
};

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload;
    },
    reset: (_state) => initialState,
  },
});
