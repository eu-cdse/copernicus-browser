import { readBlob } from '../utils';

export const extractResponseErrorMessage = async (error) => {
  let errorMsg;

  if (error?.response?.data) {
    let errorResponseData = error.response.data;

    if (error.response.data instanceof Blob) {
      errorResponseData = await readBlob(error.response.data);
    }

    if (errorResponseData?.detail) {
      if (typeof errorResponseData.detail === 'string') {
        errorMsg = errorResponseData.detail;
      } else {
        errorMsg = JSON.stringify(errorResponseData.detail);
      }
    } else {
      errorMsg = JSON.stringify(errorResponseData);
    }
  }
  return errorMsg;
};
