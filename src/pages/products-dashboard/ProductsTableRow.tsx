import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { Product } from "../../types/ProductTypes";

interface ProductsTableRowProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: number | undefined) => void;
  onTogglePublish: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
  getStatusBadgeClass: (status: string) => string;
  formatPrice: (price: number | string | null | undefined) => string;
  parseImageUrl: (imgUrl: string) => string;
  isSupplier: boolean;
}

export const ProductsTableRow = ({
  product,
  onView,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleFeatured,
  getStatusBadgeClass,
  formatPrice,
  parseImageUrl,
  isSupplier,
}: ProductsTableRowProps) => {
  return (
    <tr key={product.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <img
                src={parseImageUrl(product.imageUrls[0])}
                alt={product.name}
                className="h-10 w-10 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/150?text=No+Image";
                }}
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
              {product.name}
            </div>
            <div className="text-xs text-gray-500">SKU: {product.sku}</div>
            <div className="sm:hidden mt-1">
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                  product.status || ""
                )}`}
              >
                {product.status}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <div className="text-sm text-gray-900">
          {product.category || "Uncategorized"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatPrice(product.price)}
        </div>
        {product.compareAtPrice && (
          <div className="text-xs text-gray-500 line-through">
            {formatPrice(product.compareAtPrice)}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
        <div className="text-sm text-gray-900">{product.stock}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
            product.status || ""
          )}`}
        >
          {product.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onTogglePublish(product)}
            className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
              product.isPublished ? "bg-sky-600" : "bg-gray-200"
            }`}
            aria-pressed={product.isPublished}
            aria-labelledby={`product-${product.id}-published`}
          >
            <span className="sr-only" id={`product-${product.id}-published`}>
              {product.isPublished ? "Published" : "Unpublished"}
            </span>
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                product.isPublished ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </td>
      {!isSupplier && (
        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
          <button
            onClick={() => onToggleFeatured(product)}
            className={`text-sm ${
              product.isFeatured ? "text-yellow-500" : "text-gray-400"
            } hover:text-yellow-600 focus:outline-none`}
            title={product.isFeatured ? "Featured" : "Not Featured"}
          >
            <StarIcon
              className="h-5 w-5"
              fill={product.isFeatured ? "currentColor" : "none"}
            />
          </button>
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => onView(product)}
            className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline flex items-center justify-center"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">View</span>
          </button>
          <button
            onClick={() => onEdit(product)}
            className="text-sky-600 hover:text-sky-900 focus:outline-none focus:underline flex items-center justify-center"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="text-red-600 hover:text-red-900 focus:outline-none focus:underline flex items-center justify-center"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};