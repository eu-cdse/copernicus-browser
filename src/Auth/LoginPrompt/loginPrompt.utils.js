import store, { loginPromptSlice } from '../../store';

// Opens the "you need to be logged in" prompt for a blocked feature.
// `text` is the very message the feature used to pass to notificationSlice.displayError, so the
// wording (and its translations) stay exactly as they were — only the dialog around it changed.
// `title` is optional; omit it to let the dialog use its default "Authentication Required" heading.
export const openLoginPrompt = (text, title) =>
  store.dispatch(loginPromptSlice.actions.showLoginPrompt({ text, title }));
