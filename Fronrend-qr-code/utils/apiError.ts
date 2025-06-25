import { toast } from 'react-hot-toast';

interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export function showApiErrorToast(error: ApiError | unknown, fallbackMsg: string = 'حدث خطأ ما') {
  const apiError = error as ApiError;
  if (apiError?.response?.data?.message) {
    toast.error(apiError.response.data.message);
  } else if (apiError?.message) {
    toast.error(apiError.message);
  } else {
    toast.error(fallbackMsg);
  }
} 