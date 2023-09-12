import useAnonymousAuthFingerprint from '../AnonymousAuthFingerprint/useAnonymousAuthFingerprint';
import {
  decodeToken,
  getUserTokenFromLocalStorage,
  logoutUser,
  onLogIn,
  openLoginWindow,
} from '../authHelpers';

const useLoginLogout = () => {
  const { getAnonymousToken } = useAnonymousAuthFingerprint();

  const doLogin = async () => {
    const token = await openLoginWindow();
    onLogIn(token, decodeToken(token));
  };

  const doLogout = async () => {
    const userToken = await getUserTokenFromLocalStorage();
    await getAnonymousToken();
    await logoutUser(userToken);
  };

  return { doLogin, doLogout };
};

export default useLoginLogout;
