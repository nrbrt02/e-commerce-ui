import React from "react";
import { FolderPlusIcon } from "@heroicons/react/24/outline";
import { PlusIcon } from "lucide-react";

interface EmptyStateProps {
  searchTerm: string;
  isAdmin: boolean;
  onClearSearch: () => void;
  onCreate: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  searchTerm,
  isAdmin,
  onClearSearch,
  onCreate,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-8 text-center">
      {searchTerm ? (
        <>
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No matching categories
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search term or clear the search to see all
            categories.
          </p>
          <div className="mt-6">
            <button
              onClick={onClearSearch}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Clear Search
            </button>
          </div>
        </>
      ) : (
        <>
          <FolderPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No categories found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin
              ? "Get started by creating a new category."
              : "No categories have been created yet."}
          </p>
          {isAdmin && (
            <div className="mt-6">
              <button
                onClick={onCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                New Category
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmptyState;