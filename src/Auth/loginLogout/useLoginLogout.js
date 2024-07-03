import store, { authSlice } from '../../store';
import useAnonymousAuthRecaptcha from '../AnonymousAuthRecaptcha/useAnonymousAuthRecaptcha';
import {
  getUserTokenFromLocalStorage,
  logoutUser,
  onLogIn,
  openLoginWindow,
  saveAnonTokenToLocalStorage,
} from '../authHelpers';

const useLoginLogout = () => {
  const { clearAnonTokenRefresh } = useAnonymousAuthRecaptcha();

  const doLogin = async () => {
    const token = await openLoginWindow();
    onLogIn(token);
    store.dispatch(authSlice.actions.setAnonToken(null));
    saveAnonTokenToLocalStorage(null);
    clearAnonTokenRefresh();
  };

  const doLogout = async () => {
    const userToken = await getUserTokenFromLocalStorage();
    await logoutUser(userToken);
  };

  return { doLogin, doLogout };
};

export default useLoginLogout;
