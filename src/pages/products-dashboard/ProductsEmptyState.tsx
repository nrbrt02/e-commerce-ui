import { PlusIcon } from "@heroicons/react/24/outline";

interface ProductsEmptyStateProps {
  searchTerm: string;
  selectedCategory: string;
  isAdmin: boolean;
  isManager: boolean;
  onCreate: () => void;
}

export const ProductsEmptyState = ({
  searchTerm,
  selectedCategory,
  isAdmin,
  isManager,
  onCreate,
}: ProductsEmptyStateProps) => {
  return (
    <div className="py-16 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto h-16 w-16 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        No products found
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {searchTerm || selectedCategory !== "all"
          ? "Try adjusting your search or filter to find what you're looking for."
          : "Get started by creating your first product."}
      </p>
      {(isAdmin || isManager) && (
        <button
          onClick={onCreate}
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Your First Product
        </button>
      )}
    </div>
  );
};