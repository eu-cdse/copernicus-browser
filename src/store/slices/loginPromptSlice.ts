import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoginPromptState {
  // Body text of the prompt; null means the prompt is hidden.
  text: string | null;
  // Optional heading; left undefined so <LoginPrompt /> can fall back to its default title.
  title?: string;
}

const initialState: LoginPromptState = {
  text: null,
};

// Deliberately a slice of its own rather than a modalSlice entry: modalSlice holds a single modal
// id, so opening the prompt from inside an already-open modal (Image download, Product info) would
// replace and thereby close its parent. This slice drives an independent overlay in App.jsx that
// stacks on top instead, the same way notificationSlice / <Notification /> already does.
export const loginPromptSlice = createSlice({
  name: 'loginPrompt',
  initialState,
  reducers: {
    showLoginPrompt: (state, action: PayloadAction<{ text: string; title?: string }>) => {
      state.text = action.payload.text;
      state.title = action.payload.title;
    },
    hideLoginPrompt: () => initialState,
  },
});
