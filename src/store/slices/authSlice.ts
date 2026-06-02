import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KeycloakTokenParsed } from 'keycloak-js';

export interface UserState {
  userdata: KeycloakTokenParsed | null;
  token_expiration: number | null;
  access_token: string | null;
  error: string | null;
}

export interface AuthState {
  user: UserState;
  anonToken: string | null;
  tokenRefreshInProgress: boolean;
  termsPrivacyAccepted: boolean;
}

interface SetUserPayload {
  userdata: KeycloakTokenParsed | undefined;
  access_token: string | undefined;
  token_expiration: number | undefined;
}

const initialState: AuthState = {
  user: {
    userdata: null,
    token_expiration: null,
    access_token: null,
    error: null,
  },
  anonToken: null,
  tokenRefreshInProgress: false,
  termsPrivacyAccepted: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<SetUserPayload>) => {
      state.user.userdata = action.payload.userdata ?? null;
      state.user.access_token = action.payload.access_token ?? null;
      state.user.token_expiration = action.payload.token_expiration ?? null;
      state.user.error = null;
    },
    resetUser: (state) => {
      state.user = initialState.user;
    },
    setAnonToken: (state, action: PayloadAction<string | null>) => {
      state.anonToken = action.payload;
    },
    setTermsPrivacyAccepted: (state, action: PayloadAction<boolean>) => {
      state.termsPrivacyAccepted = action.payload;
    },
    setTokenRefreshInProgress: (state, action: PayloadAction<boolean>) => {
      state.tokenRefreshInProgress = action.payload;
    },
    setUserAuthError: (state, action: PayloadAction<string | null>) => {
      state.user.error = action.payload;
    },
  },
});
