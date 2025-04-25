// src/components/products/ProductInfoTabs.tsx
import React, { useState } from "react";
import ProductReviews from "./ProductReviews";
import ProductSpecifications from "./ProductSpecifications";
import { ApiProduct } from "../../hooks/useProducts";

interface ProductInfoTabsProps {
  product: ApiProduct;
  activeTab?: string;
}

const ProductInfoTabs: React.FC<ProductInfoTabsProps> = ({
  product,
  activeTab = "description",
}) => {
  const [currentTab, setCurrentTab] = useState<string>(activeTab);

  // Extract any additional attributes from product.metadata if it exists
  const extractAttributes = () => {
    if (!product.metadata) return [];

    try {
      const metadata = typeof product.metadata === "string"
        ? JSON.parse(product.metadata)
        : product.metadata;

      return Object.entries(metadata)
        .filter(([key, value]) => typeof value !== "object")
        .map(([key, value]) => ({
          name: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
          value: value?.toString() || "",
        }));
    } catch (error) {
      console.error("Error parsing product metadata", error);
      return [];
    }
  };

  // Extract any specifications from product.metadata
  const extractSpecifications = () => {
    if (!product.metadata) return {};

    try {
      const metadata = typeof product.metadata === "string"
        ? JSON.parse(product.metadata)
        : product.metadata;

      // Filter out specifications from metadata
      return Object.entries(metadata)
        .filter(([key]) => key.toLowerCase().includes("spec") || key.toLowerCase().includes("technical"))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {} as Record<string, any>);
    } catch (error) {
      console.error("Error parsing product specifications", error);
      return {};
    }
  };

  return (
    <div className="mt-10 border-t border-gray-200 pt-6">
      <div className="border-b border-gray-200 mb-6">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setCurrentTab("description")}
              className={`inline-block py-2 px-4 border-b-2 font-medium ${
                currentTab === "description"
                  ? "text-sky-600 border-sky-600"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Description
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setCurrentTab("specifications")}
              className={`inline-block py-2 px-4 border-b-2 font-medium ${
                currentTab === "specifications"
                  ? "text-sky-600 border-sky-600"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Specifications
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setCurrentTab("reviews")}
              className={`inline-block py-2 px-4 border-b-2 font-medium ${
                currentTab === "reviews"
                  ? "text-sky-600 border-sky-600"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Reviews
            </button>
          </li>
        </ul>
      </div>

      <div>
        {currentTab === "description" && (
          <div className="prose prose-sky max-w-none">
            <p>{product.description}</p>
            {product.shortDescription && (
              <p className="mt-4">{product.shortDescription}</p>
            )}
            {product.descriptionHtml && (
              <div
                className="mt-6"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            )}
          </div>
        )}

        {currentTab === "specifications" && (
          <ProductSpecifications
            specifications={extractSpecifications()}
            dimensions={product.dimensions}
            weight={product.weight}
            isDigital={product.isDigital}
            attributes={extractAttributes()}
            sku={product.sku}
            brand={product.brand?.name}
          />
        )}

        {currentTab === "reviews" && (
          <ProductReviews
            productId={product.id}
            initialRating={product.rating || 0}
            reviewCount={product.reviewCount || 0}
          />
        )}
      </div>
    </div>
  );
};

export default ProductInfoTabs;