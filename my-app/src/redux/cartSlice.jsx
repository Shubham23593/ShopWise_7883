import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartAPI } from "../services/api";

const initialState = {
    products: [],
    totalQuantity: 0,
    totalPrice: 0,
    loading: false,
    error: null,
};

// Async thunks for API calls
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartAPI.getCart();
            return response.cart;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
        }
    }
);

export const addToCartAsync = createAsyncThunk(
    'cart/addToCart',
    async ({ productId, product, quantity = 1 }, { rejectWithValue }) => {
        try {
            const response = await cartAPI.addToCart(productId, product, quantity);
            return response.cart;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
        }
    }
);

export const removeFromCartAsync = createAsyncThunk(
    'cart/removeFromCart',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await cartAPI.removeFromCart(productId);
            return response.cart;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
        }
    }
);

export const increaseQuantityAsync = createAsyncThunk(
    'cart/increaseQuantity',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await cartAPI.increaseQuantity(productId);
            return response.cart;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to increase quantity');
        }
    }
);

export const decreaseQuantityAsync = createAsyncThunk(
    'cart/decreaseQuantity',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await cartAPI.decreaseQuantity(productId);
            return response.cart;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to decrease quantity');
        }
    }
);

export const clearCartAsync = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartAPI.clearCart();
            return response.cart;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Local cart operations for unauthenticated users
        addToCart(state, action) {
            const newItem = action.payload;
            const itemIndex = state.products.find(item => item.id == newItem.id);

            if (itemIndex) {
                itemIndex.quantity++;
                itemIndex.totalPrice += newItem.price;
            } else {
                state.products.push({
                    id: newItem.id,
                    productId: newItem.id,
                    name: newItem.name,
                    price: newItem.price,
                    quantity: 1,
                    totalPrice: newItem.price,
                    image: newItem.image
                });
            }

            state.totalPrice += newItem.price;
            state.totalQuantity++;
        },

        removeFromCart(state, action) {
            const id = action.payload;
            const findItem = state.products.find(item => item.id == id || item.productId == id);
            if (findItem) {
                state.totalPrice -= findItem.totalPrice;
                state.totalQuantity -= findItem.quantity;
                state.products = state.products.filter(item => 
                    item.id !== id && item.productId !== id
                );
            }
        },

        increaseQuantity(state, action) {
            const id = action.payload;
            const findItem = state.products.find(item => item.id == id || item.productId == id);
            if (findItem) {
                findItem.quantity++;
                findItem.totalPrice += findItem.price;
                state.totalQuantity++;
                state.totalPrice += findItem.price;
            }
        },

        decreaseQuantity(state, action) {
            const id = action.payload;
            const productIndex = state.products.findIndex(p => 
                p.id === id || p.productId === id
            );
            if (productIndex !== -1) {
                const product = state.products[productIndex];
                if (product.quantity > 1) {
                    product.quantity -= 1;
                    product.totalPrice -= product.price;
                    state.totalQuantity -= 1;
                    state.totalPrice -= product.price;
                } else {
                    state.totalQuantity -= 1;
                    state.totalPrice -= product.price;
                    state.products.splice(productIndex, 1);
                }
            }
        },

        clearCart(state) {
            state.products = [];
            state.totalQuantity = 0;
            state.totalPrice = 0;
        },

        clearError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.products = action.payload.products || [];
                    state.totalQuantity = action.payload.totalQuantity || 0;
                    state.totalPrice = action.payload.totalPrice || 0;
                }
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Add to cart
            .addCase(addToCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.products = action.payload.products || [];
                    state.totalQuantity = action.payload.totalQuantity || 0;
                    state.totalPrice = action.payload.totalPrice || 0;
                }
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Remove from cart
            .addCase(removeFromCartAsync.fulfilled, (state, action) => {
                if (action.payload) {
                    state.products = action.payload.products || [];
                    state.totalQuantity = action.payload.totalQuantity || 0;
                    state.totalPrice = action.payload.totalPrice || 0;
                }
            })
            
            // Increase quantity
            .addCase(increaseQuantityAsync.fulfilled, (state, action) => {
                if (action.payload) {
                    state.products = action.payload.products || [];
                    state.totalQuantity = action.payload.totalQuantity || 0;
                    state.totalPrice = action.payload.totalPrice || 0;
                }
            })
            
            // Decrease quantity
            .addCase(decreaseQuantityAsync.fulfilled, (state, action) => {
                if (action.payload) {
                    state.products = action.payload.products || [];
                    state.totalQuantity = action.payload.totalQuantity || 0;
                    state.totalPrice = action.payload.totalPrice || 0;
                }
            })
            
            // Clear cart
            .addCase(clearCartAsync.fulfilled, (state, action) => {
                if (action.payload) {
                    state.products = action.payload.products || [];
                    state.totalQuantity = action.payload.totalQuantity || 0;
                    state.totalPrice = action.payload.totalPrice || 0;
                }
            });
    },
});

export const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, clearError } = cartSlice.actions;
export default cartSlice.reducer;
