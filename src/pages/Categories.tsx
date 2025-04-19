import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { ChevronDownIcon, ChevronRightIcon, PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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

  // Toggle category expansion
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Open modal for creating a new category
  const handleCreate = (parentId?: number) => {
    setCurrentCategory({
      id: 0,
      name: "",
      slug: "",
      description: "",
      image: "",
      parentId: parentId || null,
      isActive: true,
      order: 0
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
          Authorization: `Bearer ${localStorage.getItem("fast_shopping_token")}`
        }
      });
      fetchCategories(); // Refresh the list
    } catch (err: any) {
      console.error("Error deleting category:", err);
      alert(err.response?.data?.message || "Failed to delete category");
    }
  };

  // Handle form submission (create/update)
  const handleSubmit = async (categoryData: any) => {
    try {
      if (modalMode === "create") {
        await axios.post(`${API_BASE_URL}/categories`, categoryData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("fast_shopping_token")}`
          }
        });
      } else {
        await axios.put(`${API_BASE_URL}/categories/${categoryData.id}`, categoryData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("fast_shopping_token")}`
          }
        });
      }
      setIsModalOpen(false);
      fetchCategories(); // Refresh the list
    } catch (err: any) {
      console.error("Error saving category:", err);
      alert(err.response?.data?.message || "Failed to save category");
    }
  };

  // Recursive function to render category tree
  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map(category => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.includes(category.id);

      return (
        <div key={category.id} className="ml-4">
          <div className="flex items-center py-2 hover:bg-gray-50">
            {/* Toggle button for categories with children */}
            {hasChildren ? (
              <button
                onClick={() => toggleCategory(category.id)}
                className="mr-2 text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-6"></div> // Spacer for alignment
            )}

            {/* Category name and status */}
            <div className="flex-1 flex items-center">
              <span className={`font-medium ${!category.isActive ? "text-gray-400" : ""}`}>
                {category.name}
              </span>
              {!category.isActive && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                  Inactive
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleCreate(category.id)}
                className="text-gray-500 hover:text-sky-600"
                title="Add Subcategory"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEdit(category)}
                className="text-gray-500 hover:text-sky-600"
                title="Edit"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="text-gray-500 hover:text-red-600"
                title="Delete"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Render children if expanded */}
          {hasChildren && isExpanded && (
            <div className="border-l-2 border-gray-200">
              {renderCategoryTree(category.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
        <button
          onClick={() => handleCreate()}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Category
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Categories list */}
      {!loading && categories.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {renderCategoryTree(categories)}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && categories.length === 0 && (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new category.
          </p>
          <div className="mt-6">
            <button
              onClick={() => handleCreate()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              New Category
            </button>
          </div>
        </div>
      )}

      {/* Category modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        category={currentCategory}
        onSubmit={handleSubmit}
        categories={categories}
      />
    </div>
  );
};

export default Categories;