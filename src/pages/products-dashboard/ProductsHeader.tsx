import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";

interface ProductsHeaderProps {
  isSupplier: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onCreate: () => void;
}

export const ProductsHeader = ({
  isSupplier,
  isRefreshing,
  onRefresh,
  onCreate,
}: ProductsHeaderProps) => {
  const { user } = useAuth();
  const isAdmin = user?.primaryRole === 'admin' || user?.role === 'admin';
  const isSuperAdmin = user?.primaryRole === 'superadmin' || user?.role === 'superadmin';

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          {(isSupplier || isAdmin || isSuperAdmin) && (
            <button
              onClick={onCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add New Product
            </button>
          )}
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            disabled={isRefreshing}
          >
            <ArrowPathIcon
              className={`-ml-1 mr-2 h-5 w-5 text-gray-500 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};