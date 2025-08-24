import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    products: [],
    totalQuantity: 0,
    totalPrice: 0
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {

        addToCart(state, action) {
            const newItem = action.payload;
            const itemIndex = state.products.find(item => item.id == newItem.id);

            if (itemIndex) {
                itemIndex.quantity++;
                itemIndex.totalPrice += newItem.price;
            } else {
                state.products.push({
                    id: newItem.id,
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
            const findItem = state.products.find(item => item.id == id);
            if (findItem) {
                state.totalPrice -= findItem.totalPrice;
                state.totalQuantity -= findItem.quantity;
                state.products = state.products.filter(item => item.id !== id);
            }
        },

        increaseQuantity(state, action) {
            const id = action.payload;
            const findItem = state.products.find(item => item.id == id);
            if (findItem) {
                findItem.quantity++;
                findItem.totalPrice += findItem.price;
                state.totalQuantity++;
                state.totalPrice += findItem.price;
            }
        },

        decreaseQuantity(state, action) {
            const productIndex = state.products.findIndex(p => p.id === action.payload);
            if (productIndex !== -1) {
                const product = state.products[productIndex];
                if (product.quantity > 1) {
                    product.quantity -= 1;
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
        }

    },
});

export const { addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
