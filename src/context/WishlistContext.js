import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, } from "react";
import { useAuth } from "./AuthContext";
import wishlistApi from "../utils/wishlistApi";
// Create context
const WishlistContext = createContext(undefined);
// Provider component
export const WishlistProvider = ({ children, }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlists, setWishlists] = useState([]);
    const [activeWishlist, setActiveWishlist] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated, user } = useAuth();
    // Load wishlist from localStorage when component mounts
    useEffect(() => {
        const storedWishlist = localStorage.getItem("wishlist");
        if (storedWishlist) {
            try {
                const parsedWishlist = JSON.parse(storedWishlist);
                setWishlistItems(parsedWishlist);
            }
            catch (error) {
                console.error("Failed to parse wishlist from localStorage:", error);
                setWishlistItems([]);
            }
        }
        // If authenticated, fetch wishlists from API
        if (isAuthenticated && user) {
            fetchWishlists();
        }
    }, [isAuthenticated, user?.id]);
    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
    }, [wishlistItems]);
    // Fetch wishlists from API
    const fetchWishlists = async () => {
        if (!isAuthenticated)
            return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await wishlistApi.getWishlists();
            if (response?.data?.wishlists) {
                setWishlists(response.data.wishlists);
                // Set active wishlist if none is selected
                if (response.data.wishlists.length > 0 && !activeWishlist) {
                    setActiveWishlist(response.data.wishlists[0]);
                }
            }
        }
        catch (error) {
            console.error("Error fetching wishlists:", error);
            setError(error.response?.data?.message || "Failed to load wishlists");
        }
        finally {
            setIsLoading(false);
        }
    };
    // Create a new wishlist
    const createNewWishlist = async (name, description, isPublic = false) => {
        if (!isAuthenticated)
            return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await wishlistApi.createWishlist({
                name,
                description,
                isPublic,
            });
            if (response?.data?.wishlist) {
                setWishlists((prev) => [...prev, response.data.wishlist]);
                setActiveWishlist(response.data.wishlist);
            }
        }
        catch (error) {
            console.error("Error creating wishlist:", error);
            setError(error.response?.data?.message || "Failed to create wishlist");
        }
        finally {
            setIsLoading(false);
        }
    };
    // Update an existing wishlist
    const updateExistingWishlist = async (id, data) => {
        if (!isAuthenticated)
            return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await wishlistApi.updateWishlist(id, data);
            if (response?.data?.wishlist) {
                setWishlists((prev) => prev.map((wl) => (wl.id === id ? response.data.wishlist : wl)));
                if (activeWishlist?.id === id) {
                    setActiveWishlist(response.data.wishlist);
                }
            }
        }
        catch (error) {
            console.error("Error updating wishlist:", error);
            setError(error.response?.data?.message || "Failed to update wishlist");
        }
        finally {
            setIsLoading(false);
        }
    };
    // Delete an existing wishlist
    const deleteExistingWishlist = async (id) => {
        if (!isAuthenticated)
            return;
        setIsLoading(true);
        setError(null);
        try {
            await wishlistApi.deleteWishlist(id);
            setWishlists((prev) => prev.filter((wl) => wl.id !== id));
            if (activeWishlist?.id === id) {
                const remainingWishlists = wishlists.filter((wl) => wl.id !== id);
                setActiveWishlist(remainingWishlists.length > 0 ? remainingWishlists[0] : null);
            }
        }
        catch (error) {
            console.error("Error deleting wishlist:", error);
            setError(error.response?.data?.message || "Failed to delete wishlist");
        }
        finally {
            setIsLoading(false);
        }
    };
    // Add an item to wishlist
    const addToWishlist = (product) => {
        setWishlistItems((prevItems) => {
            // Check if the product is already in the wishlist
            if (prevItems.some((item) => item.id === product.id)) {
                return prevItems;
            }
            // Add the product to the wishlist
            return [...prevItems, product];
        });
        // If authenticated and active wishlist exists, add to API
        if (isAuthenticated && activeWishlist) {
            wishlistApi
                .addProductToWishlist(activeWishlist.id, {
                productId: parseInt(product.id),
                notes: "",
            })
                .catch((error) => {
                console.error("Failed to add product to wishlist in API:", error);
            });
        }
    };
    // Remove an item from wishlist
    const removeFromWishlist = async (productId) => {
        if (!user) {
            console.error("User not authenticated");
            return false;
        }
        try {
            // First, find the item in our default wishlist
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
            // Get the default wishlist first to find the item ID
            const wishlistResponse = await fetch(`${apiBaseUrl}/wishlists/default`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            if (!wishlistResponse.ok) {
                throw new Error("Failed to fetch wishlist");
            }
            const wishlistData = await wishlistResponse.json();
            if (!wishlistData.data ||
                !wishlistData.data.wishlist ||
                !wishlistData.data.wishlist.items) {
                throw new Error("Invalid wishlist data received");
            }
            const wishlist = wishlistData.data.wishlist;
            const itemToRemove = wishlist.items.find((item) => item.product && item.product.id.toString() === productId.toString());
            if (!itemToRemove) {
                throw new Error("Item not found in wishlist");
            }
            // Now remove the item using its ID
            const removeResponse = await fetch(`${apiBaseUrl}/wishlists/${wishlist.id}/items/${itemToRemove.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            if (!removeResponse.ok) {
                throw new Error("Failed to remove from wishlist");
            }
            // Update local state
            setWishlistItems((prevItems) => prevItems.filter((item) => item.id.toString() !== productId.toString()));
            return true;
        }
        catch (error) {
            console.error("Error removing from wishlist:", error);
            return false;
        }
    };
    // Check if an item is in the wishlist
    const isInWishlist = (productId) => {
        return wishlistItems.some((item) => item.id === productId);
    };
    // Clear the wishlist
    const clearWishlist = () => {
        setWishlistItems([]);
    };
    return (_jsx(WishlistContext.Provider, { value: {
            wishlistItems,
            wishlistCount: wishlistItems.length,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            clearWishlist,
            wishlists,
            activeWishlist,
            setActiveWishlist,
            fetchWishlists,
            createNewWishlist,
            updateExistingWishlist,
            deleteExistingWishlist,
            isLoading,
            error,
        }, children: children }));
};
// Custom hook to use the wishlist context
export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
};
export default WishlistContext;
