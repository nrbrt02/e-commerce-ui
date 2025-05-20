export const ProductsTableLoading = () => {
  return (
    <div className="p-6">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
      {[...Array(5)].map((_, index) => (
        <div key={index} className="mb-6 animate-pulse">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-md mr-4"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-1 bg-gray-100 my-4"></div>
        </div>
      ))}
    </div>
  );
};