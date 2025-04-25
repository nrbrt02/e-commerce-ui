import React from "react";

interface Dimension {
  width: number;
  height: number;
  length: number;
}

interface ProductSpecificationsProps {
  specifications?: {
    [key: string]: string | number | boolean | object;
  };
  dimensions?: Dimension;
  weight?: number;
  isDigital?: boolean;
  attributes?: {
    name: string;
    value: string;
  }[];
  sku: string;
  brand?: string;
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  specifications = {},
  dimensions,
  weight,
  isDigital = false,
  attributes = [],
  sku,
  brand,
}) => {
  return (
    <div className="py-6">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {brand && (
              <tr className="border-b border-gray-200">
                <th className="text-left bg-gray-50 px-6 py-3 text-gray-600 font-medium w-1/3">
                  Brand
                </th>
                <td className="px-6 py-3 text-gray-800">{brand}</td>
              </tr>
            )}
            
            <tr className="border-b border-gray-200">
              <th className="text-left bg-gray-50 px-6 py-3 text-gray-600 font-medium w-1/3">
                SKU
              </th>
              <td className="px-6 py-3 text-gray-800">{sku}</td>
            </tr>
            
            <tr className="border-b border-gray-200">
              <th className="text-left bg-gray-50 px-6 py-3 text-gray-600 font-medium w-1/3">
                Product Type
              </th>
              <td className="px-6 py-3 text-gray-800">
                {isDigital ? "Digital Product" : "Physical Product"}
              </td>
            </tr>
            
            {!isDigital && dimensions && (
              <tr className="border-b border-gray-200">
                <th className="text-left bg-gray-50 px-6 py-3 text-gray-600 font-medium w-1/3">
                  Dimensions (W × H × L)
                </th>
                <td className="px-6 py-3 text-gray-800">
                  {dimensions.width} × {dimensions.height} × {dimensions.length} cm
                </td>
              </tr>
            )}
            
            {!isDigital && weight !== undefined && (
              <tr className="border-b border-gray-200">
                <th className="text-left bg-gray-50 px-6 py-3 text-gray-600 font-medium w-1/3">
                  Weight
                </th>
                <td className="px-6 py-3 text-gray-800">
                  {weight} g
                </td>
              </tr>
            )}
            
            {/* Display custom attributes */}
            {attributes.map((attr, index) => (
              <tr key={index} className="border-b border-gray-200">
                <th className="text-left bg-gray-50 px-6 py-3 text-gray-600 font-medium w-1/3">
                  {attr.name}
                </th>
                <td className="px-6 py-3 text-gray-800">{attr.value}</td>
              </tr>
            ))}
            
            {/* Display additional specifications */}
            {Object.entries(specifications).map(([key, value]) => {
              // Skip rendering if value is an object (handle it differently)
              if (typeof value === 'object' && value !== null) return null;
              
              return (
                <tr key={key} className="border-b border-gray-200">
                  <th className="text-left bg-gray-50 px-6 py-3 text-gray-600 font-medium w-1/3">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </th>
                  <td className="px-6 py-3 text-gray-800">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Technical Specifications Section */}
      {Object.entries(specifications).some(([_, value]) => typeof value === 'object' && value !== null) && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Technical Specifications</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(specifications).map(([key, value]) => {
              if (typeof value !== 'object' || value === null) return null;
              
              return (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h4>
                  <ul className="space-y-2">
                    {Object.entries(value as object).map(([subKey, subValue]) => (
                      <li key={subKey} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {subKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span className="font-medium text-gray-800">
                          {typeof subValue === 'boolean' ? (subValue ? 'Yes' : 'No') : subValue.toString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSpecifications;