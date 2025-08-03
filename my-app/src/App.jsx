import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Profile from "./pages/Profile"
import Contact from "./components/Contact";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import FilterData from "./components/FilterData";
import OrderSuccess from "./components/OrderSuccess";
import AuthForm from "./components/AuthForm";
import { AuthProvider, useAuth } from "./context/AuthContext";




function AppRoutes() {
  const [order, setOrder] = useState(null);
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/Contact" element={<Contact />} /> 
         <Route path="/profile" element={<Profile />} />
        <Route path="/checkout" element={<Checkout setOrder={setOrder} />} />
        <Route path="/order-confirmation" element={<OrderSuccess />} />
        <Route path="/filter-data" element={<FilterData />} />

        <Route
          path="/auth"
          element={!user ? <AuthForm /> : <Navigate to="/" />}
        />
      </Routes>

      <Footer />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
