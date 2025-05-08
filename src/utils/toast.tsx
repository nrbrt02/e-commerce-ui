// utils/toast.ts
import { toast, ToastOptions } from 'react-toastify';

export type ToastFunction = (options: {
  title: string;
  description: string;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'destructive';
}) => void;

const useToast = (): { toast: ToastFunction } => {
  const showToast: ToastFunction = ({ title, description, variant = 'info' }) => {
    const toastOptions: ToastOptions = {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    };

    switch (variant) {
      case 'success':
        toast.success(`${title}: ${description}`, toastOptions);
        break;
      case 'error':
      case 'destructive':
        toast.error(`${title}: ${description}`, toastOptions);
        break;
      case 'warning':
        toast.warn(`${title}: ${description}`, toastOptions);
        break;
      case 'info':
      default:
        toast.info(`${title}: ${description}`, toastOptions);
        break;
    }
  };

  return { toast: showToast };
};

export default useToast;