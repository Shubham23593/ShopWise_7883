import React from "react";

const Modal = ({ isModalOpen, setIsModalOpen, children }) => {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="relative bg-white p-6 rounded shadow-md w-full max-w-md border">
        <button
          className="absolute top-2 right-2 text-lg font-bold text-gray-700 hover:text-black"
          onClick={() => setIsModalOpen(false)}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
