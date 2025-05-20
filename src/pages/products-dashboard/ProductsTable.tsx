import { Product } from "../../types/ProductTypes";
import { ProductsTableRow } from "./ProductsTableRow";
import { ProductsTableLoading } from "./ProductsTableLoading";

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: number | undefined) => void;
  onTogglePublish: (product: Product) => void;
  onToggleFeatured: (product: Product) => void;
  getStatusBadgeClass: (status: string) => string;
  formatPrice: (price: number | string | null | undefined) => string;
  parseImageUrl: (imgUrl: string) => string;
}

export const ProductsTable = ({
  products,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleFeatured,
  getStatusBadgeClass,
  formatPrice,
  parseImageUrl,
}: ProductsTableProps) => {
  if (isLoading) {
    return <ProductsTableLoading />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Product
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
            >
              Category
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Price
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
            >
              Stock
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
            >
              Visibility
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <ProductsTableRow
              key={product.id}
              product={product}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePublish={onTogglePublish}
              onToggleFeatured={onToggleFeatured}
              getStatusBadgeClass={getStatusBadgeClass}
              formatPrice={formatPrice}
              parseImageUrl={parseImageUrl}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};