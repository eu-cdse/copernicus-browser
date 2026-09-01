import axios from 'axios';

/** Extract the most useful detail from an axios/other error for logging. */
export const errData = (error: unknown): unknown => {
  if (axios.isAxiosError(error)) {
    return error.response?.data ?? error.message;
  }
  return error instanceof Error ? error.message : error;
};
