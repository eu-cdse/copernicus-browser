export async function refetchWithDefaultToken(fetchingFunction, reqConfig) {
  try {
    return await fetchingFunction(reqConfig);
  } catch (err) {
    let shouldRefetchWithDefaultToken = false;

    if (err.response) {
      const { status } = err.response;
      switch (status) {
        case 403:
          shouldRefetchWithDefaultToken = reqConfig && !!reqConfig.authToken;
          break;
        case 429:
          shouldRefetchWithDefaultToken = true;
          break;
        default:
          shouldRefetchWithDefaultToken = false;
      }
    }

    if (shouldRefetchWithDefaultToken) {
      reqConfig = { ...reqConfig, authToken: null };
      return await fetchingFunction(reqConfig);
    }
    throw err;
  }
}
