import React from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { Category } from "../../types/categoryTypes";

interface CategoryNodeProps {
  category: Category;
  level: number;
  isExpanded: boolean;
  hasChildren?: boolean;
  isAdmin: boolean;
  isSuperadmin: boolean;
  onToggle: () => void;
  onCreate: (parentId: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  category,
  level,
  isExpanded,
  hasChildren,
  isAdmin,
  isSuperadmin,
  onToggle,
  onCreate,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`${level > 0 ? "ml-6" : "ml-2"} border-l-2 ${
        level > 0 ? "border-gray-100" : "border-transparent"
      }`}
    >
      <div
        className={`flex items-center py-3 px-2 ${
          level > 0 ? "hover:bg-gray-50" : "hover:bg-sky-50"
        } rounded-lg transition-colors duration-150 ease-in-out`}
      >
        {hasChildren ? (
          <button
            onClick={onToggle}
            className="mr-2 text-gray-500 hover:text-sky-600 transition-colors duration-150"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5" />
            ) : (
              <ChevronRightIcon className="h-5 w-5" />
            )}
          </button>
        ) : (
          <span className="mr-2 text-gray-300">
            <FolderIcon className="h-5 w-5" />
          </span>
        )}

        <div className="flex-1 flex items-center">
          <span
            className={`font-medium ${
              !category.isActive ? "text-gray-400" : "text-gray-700"
            }`}
          >
            {category.name}
          </span>
          {!category.isActive && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              Inactive
            </span>
          )}
          {category.image && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-sky-100 text-sky-600">
              Has Image
            </span>
          )}
        </div>

        {(isAdmin || isSuperadmin) && (
          <div className="flex space-x-2">
            <button
              onClick={() => onCreate(category.id)}
              className="text-gray-500 hover:text-sky-600 p-1 rounded-full hover:bg-sky-50 transition-colors duration-150"
              title="Add Subcategory"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(category)}
              className="text-gray-500 hover:text-sky-600 p-1 rounded-full hover:bg-sky-50 transition-colors duration-150"
              title="Edit"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            {isSuperadmin && (
              <button
                onClick={() => onDelete(category.id)}
                className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors duration-150"
                title="Delete"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryNode;