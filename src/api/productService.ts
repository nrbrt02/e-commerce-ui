const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const createProduct = async (productData: Product) => {
  const response = await axios.post(`${API_BASE_URL}/products`, {
    ...productData,
    images: productData.imageUrls,
    categories: productData.categoryIds,
  }, { headers: getAuthHeaders() });
  return response.data;
};

export const updateProduct = async (id: number, productData: Product) => {
  const response = await axios.put(`${API_BASE_URL}/products/${id}`, {
    ...productData,
    images: productData.imageUrls,
    categories: productData.categoryIds,
  }, { headers: getAuthHeaders() });
  return response.data;
};