import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
// import { Link } from "react-router-dom";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  FolderIcon,
  FolderPlusIcon,
} from "@heroicons/react/24/outline";
import CategoryModal from "../components/dashboard/CategoryModal";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number;
  isActive: boolean;
  order: number;
  children?: Category[];
}

const Categories: React.FC = () => {
  const { user } = useAuth();
  // Check if user has admin privileges
  useEffect(() => {
    console.log("Categories - Current user object:", user);
  }, [user]);

  // Improved hasRole function
  const hasRole = (roleName: string) => {
    // Check primaryRole first
    if (user?.primaryRole === roleName) return true;

    // Check legacy role property
    if (user?.role === roleName) return true;

    // Check roles array if it exists
    if (user?.roles) {
      // For array of strings
      if (Array.isArray(user.roles) && typeof user.roles[0] === "string") {
        return user.roles.includes(roleName);
      }

      // For array of objects with name property
      if (Array.isArray(user.roles) && typeof user.roles[0] === "object") {
        return user.roles.some((role) => role.name === roleName);
      }
    }

    return false;
  };

  const isAdmin = hasRole("admin");
  // const isManager = !isAdmin && hasRole("manager");
  // const isSupplier = !isAdmin && !isManager && hasRole("supplier");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // API base URL
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/categories/tree`);
      setCategories(response.data.data.categories);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.response?.data?.message || "Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Refresh categories
  const refreshCategories = async () => {
    setIsRefreshing(true);
    await fetchCategories();
    setIsRefreshing(false);
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Toggle all categories expansion
  const toggleAllCategories = () => {
    if (expandedCategories.length > 0) {
      setExpandedCategories([]);
    } else {
      const allCategoryIds: number[] = [];

      const collectIds = (cats: Category[]) => {
        cats.forEach((cat) => {
          allCategoryIds.push(cat.id);
          if (cat.children?.length) {
            collectIds(cat.children);
          }
        });
      };

      collectIds(categories);
      setExpandedCategories(allCategoryIds);
    }
  };

  // Open modal for creating a new category
  const handleCreate = (parentId?: number) => {
    setCurrentCategory({
      id: 0,
      name: "",
      slug: "",
      description: "",
      image: "",
      parentId: parentId || 0,
      isActive: true,
      order: 0,
    });
    setModalMode("create");
    setIsModalOpen(true);
  };

  // Open modal for editing a category
  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  // Handle category deletion
  const handleDelete = async (categoryId: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/categories/${categoryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "fast_shopping_token"
          )}`,
        },
      });
      setNotification({
        type: "success",
        message: "Category successfully deleted",
      });
      setTimeout(() => setNotification(null), 3000);
      fetchCategories(); // Refresh the list
    } catch (err: any) {
      console.error("Error deleting category:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to delete category",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Handle form submission (create/update)
  const handleSubmit = async (categoryData: any) => {
    try {
      if (modalMode === "create") {
        await axios.post(`${API_BASE_URL}/categories`, categoryData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "fast_shopping_token"
            )}`,
          },
        });
        setNotification({
          type: "success",
          message: "Category successfully created",
        });
      } else {
        await axios.put(
          `${API_BASE_URL}/categories/${categoryData.id}`,
          categoryData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "fast_shopping_token"
              )}`,
            },
          }
        );
        setNotification({
          type: "success",
          message: "Category successfully updated",
        });
      }
      setTimeout(() => setNotification(null), 3000);
      setIsModalOpen(false);
      fetchCategories(); // Refresh the list
    } catch (err: any) {
      console.error("Error saving category:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.message || "Failed to save category",
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Filter categories based on search term
  const filterCategories = (
    categories: Category[],
    term: string
  ): Category[] => {
    if (!term) return categories;

    return categories.reduce<Category[]>((filtered, category) => {
      // Check if this category matches
      const categoryMatches = category.name
        .toLowerCase()
        .includes(term.toLowerCase());

      // Filter children
      const filteredChildren = category.children
        ? filterCategories(category.children, term)
        : [];

      // Include this category if it matches or has matching children
      if (categoryMatches || filteredChildren.length > 0) {
        filtered.push({
          ...category,
          children: filteredChildren,
        });
      }

      return filtered;
    }, []);
  };

  // Get filtered categories
  const filteredCategories = filterCategories(categories, searchTerm);

  // Recursive function to render category tree
  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.includes(category.id);

      return (
        <div
          key={category.id}
          className={`${level > 0 ? "ml-6" : "ml-2"} border-l-2 ${
            level > 0 ? "border-gray-100" : "border-transparent"
          }`}
        >
          <div
            className={`flex items-center py-3 px-2 ${
              level > 0 ? "hover:bg-gray-50" : "hover:bg-sky-50"
            } rounded-lg transition-colors duration-150 ease-in-out`}
          >
            {/* Toggle button for categories with children */}
            {hasChildren ? (
              <button
                onClick={() => toggleCategory(category.id)}
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

            {/* Category name and status */}
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

            {/* Action buttons - only visible to admin users */}
            {isAdmin ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCreate(category.id)}
                  className="text-gray-500 hover:text-sky-600 p-1 rounded-full hover:bg-sky-50 transition-colors duration-150"
                  title="Add Subcategory"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(category)}
                  className="text-gray-500 hover:text-sky-600 p-1 rounded-full hover:bg-sky-50 transition-colors duration-150"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors duration-150"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-20"></div>
            )}
          </div>

          {/* Render children if expanded */}

          {hasChildren && isExpanded && (
            <div className="pt-1 pb-1">
              {renderCategoryTree(category.children || [], level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with title and actions */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Category Management
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {searchTerm && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm("")}
                >
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
              )}
            </div>
            <button
              onClick={refreshCategories}
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
              onClick={toggleAllCategories}
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
            {isAdmin && (
              <button
                onClick={() => handleCreate()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Add Category
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-md ${
            notification.type === "success"
              ? "bg-green-50 border-l-4 border-green-500"
              : "bg-red-50 border-l-4 border-red-500"
          } transition-opacity duration-300`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
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
                  notification.type === "success"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {notification.message}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setNotification(null)}
                  className={`inline-flex p-1.5 rounded-md ${
                    notification.type === "success"
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
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex p-1.5 rounded-md text-red-500 hover:bg-red-100"
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
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-center space-x-4"
              >
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="ml-auto flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories list */}
      {!loading && filteredCategories.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4">{renderCategoryTree(filteredCategories)}</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredCategories.length === 0 && (
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
                  onClick={() => setSearchTerm("")}
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
                    onClick={() => handleCreate()}
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
      )}

      {/* Category modal - only render if user is admin */}
      {isAdmin && (
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode={modalMode}
          category={currentCategory}
          onSubmit={handleSubmit}
          categories={categories}
        />
      )}
    </div>
  );
};

export default Categories;
