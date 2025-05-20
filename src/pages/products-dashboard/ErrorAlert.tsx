import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ErrorAlertProps {
  error: string | null;
  onDismiss: () => void;
}

export const ErrorAlert = ({ error, onDismiss }: ErrorAlertProps) => {
  if (!error) return null;

  return (
    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-500 hover:text-red-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};