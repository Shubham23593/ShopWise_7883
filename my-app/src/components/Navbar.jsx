import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";
import AuthForm from "./AuthForm";
import { setSearchTerm } from "../redux/productSlice";

const Navbar = () => {
  const cartProducts = useSelector((state) => state.cart.products);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { user, loading } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setSearchTerm(search));
  };

  const openAuthModal = () => {
    setIsModalOpen(true);
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  return (
   <nav className="bg-white shadow-md">

      <div className="container mx-auto px-4 md:px-16 lg:px-24 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-lg font-bold hover:text-[#3B2F2F] transition-colors duration-200">
          <Link to="/">ShopWise</Link>
        </div>

        {/* Search */}
        <div className="flex-1 mx-4">
          <form className="relative" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search product..."
              className="w-full border rounded-md py-2 px-4 pr-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">
              <FaSearch className="absolute top-1/2 right-3 transform -translate-y-1/2 text-amber-900" />
            </button>
          </form>
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          {/* Cart */}
          <Link to="/cart" className="relative">
            <FaShoppingCart className="text-lg" />
            {cartProducts.length > 0 && (
              <span className="absolute -top-2 -right-2 text-xs w-5 h-5 bg-[#3B2F2F] rounded-full flex justify-center items-center text-white">
                {cartProducts.length}
              </span>
            )}
          </Link>

          {/* User */}
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : user ? (
            <>
              {/* 👤 icon navigates to /profile */}
              <button onClick={goToProfile}>
                <FaUser className="text-xl" />
              </button>
            </>
          ) : (
            <>
              {/* Login/Register */}
              <button
                className="hidden md:block text-sm font-medium"
                onClick={openAuthModal}
              >
                Login | Register
              </button>

              <button className="block md:hidden" onClick={openAuthModal}>
                <FaUser className="text-xl" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center justify-center space-x-10 py-4 text-sm font-bold">
        <Link
          to="/"
          className="text-black hover:text-amber-900 transition-colors duration-200"
        >
          Home
        </Link>
        <Link
          to="/shop"
          className="text-black hover:text-amber-900 transition-colors duration-200"
        >
          Shop
        </Link>
        <Link
          to="/Contact"
          className="text-black hover:text-amber-900 transition-colors duration-200"
        >
          Contact
        </Link>
        <Link
          to="/about"
          className="text-black hover:text-amber-900 transition-colors duration-200"
        >
          About
        </Link>
      </div>

      {/* Modal for Auth */}
      <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
        <AuthForm closeModal={() => setIsModalOpen(false)} />
      </Modal>
    </nav>
  );
};

export default Navbar;
