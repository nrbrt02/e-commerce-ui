import React from "react";
import { ArrowPathIcon, ChevronDownIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";

interface CategoryHeaderProps {
  title: string;
  isRefreshing: boolean;
  expandedCategories: number[];
  isAdmin: boolean;
  isSuperadmin: boolean;
  onRefresh: () => void;
  onToggleAll: () => void;
  onCreate: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  title,
  isRefreshing,
  expandedCategories,
  isAdmin,
  isSuperadmin,
  onRefresh,
  onToggleAll,
  onCreate,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={isRefreshing}
          >
            <ArrowPathIcon
              className={`-ml-1 mr-2 h-5 w-5 text-gray-500 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
          <button
            onClick={onToggleAll}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {expandedCategories.length > 0 ? (
              <>
                <ChevronRightIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDownIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                Expand All
              </>
            )}
          </button>
          {(isAdmin || isSuperadmin) && (
            <button
              onClick={onCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Category
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryHeader;