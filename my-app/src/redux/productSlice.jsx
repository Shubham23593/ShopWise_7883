import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    products: [],
    searchTerm: '',
    filteredData: []
};

const productSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        setProducts(state, action) {
            state.products = action.payload;
            state.filteredData = action.payload; // initially show all
        },
        setSearchTerm(state, action) {
            state.searchTerm = action.payload;
            if (state.searchTerm.trim() === "") {
                state.filteredData = state.products;
            } else {
                state.filteredData = state.products.filter((product) =>
                    product.name.toLowerCase().includes(state.searchTerm.toLowerCase())
                );
            }
        },
        filterByCategory(state, action) {
            const category = action.payload;
            if (category === "All") {
                state.filteredData = state.products;
            } else {
                state.filteredData = state.products.filter(
                    (product) => product.brand === category
                );
            }
        },
    },
});

export const { setProducts, setSearchTerm, filterByCategory } = productSlice.actions;
export default productSlice.reducer;
