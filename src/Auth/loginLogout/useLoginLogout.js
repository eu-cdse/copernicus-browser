import { logoutUser, openLogin } from '../authHelpers';

const useLoginLogout = () => {
  const doLogin = async () => {
    return await openLogin();
  };

  const doLogout = async () => {
    await logoutUser();
  };

  return { doLogin, doLogout };
};

export default useLoginLogout;
