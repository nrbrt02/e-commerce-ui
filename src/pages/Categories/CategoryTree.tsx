import React from "react";
import CategoryNode from "./CategoryNode";
import { Category } from "../../types/categoryTypes";

interface CategoryTreeProps {
  categories: Category[];
  expandedCategories: number[];
  isAdmin: boolean;
  isSuperadmin: boolean;
  onToggleCategory: (categoryId: number) => void;
  onCreate: (parentId?: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  expandedCategories,
  isAdmin,
  isSuperadmin,
  onToggleCategory,
  onCreate,
  onEdit,
  onDelete,
}) => {
  const renderCategoryTree = (categories: Category[], level = 0) => {
    return categories.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.includes(category.id);

      return (
        <React.Fragment key={category.id}>
          <CategoryNode
            category={category}
            level={level}
            isExpanded={isExpanded}
            hasChildren={hasChildren}
            isAdmin={isAdmin}
            isSuperadmin={isSuperadmin}
            onToggle={() => onToggleCategory(category.id)}
            onCreate={onCreate}
            onEdit={onEdit}
            onDelete={onDelete}
          />
          {hasChildren && isExpanded && (
            <div className="pt-1 pb-1">
              {renderCategoryTree(category.children || [], level + 1)}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  return <div className="p-4">{renderCategoryTree(categories)}</div>;
};

export default CategoryTree;