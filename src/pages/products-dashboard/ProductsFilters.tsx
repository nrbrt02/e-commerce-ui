import {
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ProductsFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  resultsPerPage: number;
  categories: { id: string; name: string }[];
  onSearchChange: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onResultsPerPageChange: (value: number) => void;
  onClearFilters: () => void;
}

export const ProductsFilters = ({
  searchTerm,
  selectedCategory,
  resultsPerPage,
  categories,
  onSearchChange,
  onCategoryChange,
  onResultsPerPageChange,
  onClearFilters,
}: ProductsFiltersProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search Products
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => onSearchChange("")}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Filter by Category
          </label>
          <select
            id="category"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="resultsPerPage"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Results per page
          </label>
          <select
            id="resultsPerPage"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            value={resultsPerPage}
            onChange={(e) => onResultsPerPageChange(Number(e.target.value))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {(searchTerm || selectedCategory !== "all") && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};