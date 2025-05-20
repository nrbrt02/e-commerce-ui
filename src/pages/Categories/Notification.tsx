import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface NotificationProps {
  type: "success" | "error";
  message: string;
  onDismiss: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  onDismiss,
}) => {
  return (
    <div
      className={`mb-6 p-4 rounded-md ${
        type === "success"
          ? "bg-green-50 border-l-4 border-green-500"
          : "bg-red-50 border-l-4 border-red-500"
      } transition-opacity duration-300`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {type === "success" ? (
            <svg
              className="h-5 w-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div className="ml-3">
          <p
            className={`text-sm ${
              type === "success" ? "text-green-700" : "text-red-700"
            }`}
          >
            {message}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onDismiss}
              className={`inline-flex p-1.5 rounded-md ${
                type === "success"
                  ? "text-green-500 hover:bg-green-100"
                  : "text-red-500 hover:bg-red-100"
              }`}
            >
              <span className="sr-only">Dismiss</span>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;