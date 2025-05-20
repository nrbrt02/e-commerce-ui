import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { AUTH_TOKEN_KEY } from "../../constants/auth-constants";

// Import components
import CategoryHeader from "./CategoryHeader";
import CategorySearch from "./CategorySearch";
import Notification from "./Notification";
import CategoryTree from "./CategoryTree";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import CategoryModal from "./CategoryModal";

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
  const hasRole = (roleName: string) => {
    if (user?.primaryRole === roleName) return true;
    if (user?.role === roleName) return true;

    if (user?.roles) {
      if (Array.isArray(user.roles) && typeof user.roles[0] === 'string') {
        return user.roles.includes(roleName);
      }

      if (Array.isArray(user.roles) && typeof user.roles[0] === 'object') {
        return user.roles.some((role: string | { name: string }) => {
          if (typeof role === 'string') {
            return role === roleName;
          } else {
            return role.name === roleName;
          }
        });
      }
    }

    return false;
  };

  const isAdmin = hasRole("admin");
  const isSuperadmin = hasRole("superadmin");
  
  // State management
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
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
        },
      });
      setNotification({
        type: "success",
        message: "Category successfully deleted",
      });
      setTimeout(() => setNotification(null), 3000);
      fetchCategories();
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
            Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
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
              Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}`,
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
      fetchCategories();
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
  const filterCategories = (categories: Category[], term: string): Category[] => {
    if (!term) return categories;

    return categories.reduce<Category[]>((filtered, category) => {
      const categoryMatches = category.name
        .toLowerCase()
        .includes(term.toLowerCase());

      const filteredChildren = category.children
        ? filterCategories(category.children, term)
        : [];

      if (categoryMatches || filteredChildren.length > 0) {
        filtered.push({
          ...category,
          children: filteredChildren,
        });
      }

      return filtered;
    }, []);
  };

  const filteredCategories = filterCategories(categories, searchTerm);

  // Only allow admin and superadmin to access category modifications
  if (!isAdmin && !isSuperadmin) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You don't have permission to access this page. This page is restricted to administrators.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <CategoryHeader
        title="Category Management"
        isRefreshing={isRefreshing}
        expandedCategories={expandedCategories}
        isAdmin={isAdmin}
        isSuperadmin={isSuperadmin}
        onRefresh={refreshCategories}
        onToggleAll={toggleAllCategories}
        onCreate={() => handleCreate()}
      />

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}

      {error && (
        <Notification
          type="error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      <div className="mb-6">
        <CategorySearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClearSearch={() => setSearchTerm("")}
        />
      </div>

      {loading && <LoadingState />}

      {!loading && filteredCategories.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <CategoryTree
            categories={filteredCategories}
            expandedCategories={expandedCategories}
            isAdmin={isAdmin}
            isSuperadmin={isSuperadmin}
            onToggleCategory={toggleCategory}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {!loading && filteredCategories.length === 0 && (
        <EmptyState
          searchTerm={searchTerm}
          isAdmin={isAdmin || isSuperadmin}
          onClearSearch={() => setSearchTerm("")}
          onCreate={() => handleCreate()}
        />
      )}

      {(isAdmin || isSuperadmin) && (
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