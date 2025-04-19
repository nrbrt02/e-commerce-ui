import React from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
}

interface Supplier {
  id: number;
  username: string;
  email: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  sku: string;
  barcode: string;
  price: string;
  compareAtPrice: string | null;
  costPrice: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  quantity: number;
  lowStockThreshold: number | null;
  weight: number | null;
  dimensions: {
    width: number;
    height: number;
    length: number;
  } | null;
  metadata: any;
  tags: string[];
  imageUrls: string[];
  supplierId: number;
  createdAt: string;
  updatedAt: string;
  supplier: Supplier;
  categories: Category[];
}

interface ProductDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
  }

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  const formatPrice = (price: string | null) => {
    if (!price) return '';
    return parseFloat(price).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatus = () => {
    if (product.quantity <= 0) return 'Out of Stock';
    if (product.lowStockThreshold && product.quantity <= product.lowStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Product Images */}
                  <div className="col-span-1">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Images</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {product.imageUrls && product.imageUrls.length > 0 ? (
                        product.imageUrls.map((img, index) => (
                          <div key={index} className="aspect-square overflow-hidden rounded-md bg-gray-100">
                            <img 
                              src={JSON.parse(img).url} 
                              alt={`Product ${index + 1}`} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 aspect-square bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Product Details */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">SKU</h4>
                        <p className="mt-1 text-sm text-gray-900">{product.sku}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Barcode</h4>
                        <p className="mt-1 text-sm text-gray-900">{product.barcode || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Price</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatPrice(product.price)}
                          {product.compareAtPrice && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Cost Price</h4>
                        <p className="mt-1 text-sm text-gray-900">{formatPrice(product.costPrice)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Stock Quantity</h4>
                        <p className="mt-1 text-sm text-gray-900">{product.quantity}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Low Stock Threshold</h4>
                        <p className="mt-1 text-sm text-gray-900">{product.lowStockThreshold || 'Not set'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                        <p className="mt-1 text-sm text-gray-900">{getStatus()}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Weight</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {product.weight ? `${product.weight} g` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Dimensions</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {product.dimensions 
                            ? `${product.dimensions.length} × ${product.dimensions.width} × ${product.dimensions.height} cm` 
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Published</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {product.isPublished ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Featured</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {product.isFeatured ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Digital Product</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {product.isDigital ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Supplier</h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {product.supplier?.username || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500">Short Description</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {product.shortDescription || 'No short description provided'}
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500">Description</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {product.description || 'No description provided'}
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500">Tags</h4>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {product.tags && product.tags.length > 0 ? (
                          product.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No tags</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500">Categories</h4>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {product.categories && product.categories.length > 0 ? (
                          product.categories.map((category) => (
                            <span key={category.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {category.name}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No categories assigned</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Created At</h4>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(product.createdAt)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Updated At</h4>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(product.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;