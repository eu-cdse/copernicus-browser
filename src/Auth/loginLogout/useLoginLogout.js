import useAnonymousAuthFingerprint from '../AnonymousAuthFingerprint/useAnonymousAuthFingerprint';
import { getUserTokenFromLocalStorage, logoutUser, onLogIn, openLoginWindow } from '../authHelpers';

const useLoginLogout = () => {
  const { getAnonymousToken, clearAnonTokenRefresh } = useAnonymousAuthFingerprint();

  const doLogin = async () => {
    const token = await openLoginWindow();
    onLogIn(token);
    clearAnonTokenRefresh();
  };

  const doLogout = async () => {
    const userToken = await getUserTokenFromLocalStorage();
    await getAnonymousToken();
    await logoutUser(userToken);
  };

  return { doLogin, doLogout };
};

export default useLoginLogout;
