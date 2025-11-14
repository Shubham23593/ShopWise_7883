import { useLocation, useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return <p>No order data found.</p>;
  }

  const { products, totalPrice, totalItems } = state;

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <h2 className="text-4xl font-bold text-green-600 mb-6">
        🎉 Order Successful!
      </h2>
      <p className="text-lg mb-4">
        Thank you for your purchase. Here’s your order summary:
      </p>

      <div className="space-y-4">
        {products.map((product, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 bg-slate-50 p-2 rounded-lg shadow"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h5 className="font-medium">{product.name}</h5>
              <p className="text-gray-600">
                ₹{product.price} x {product.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 font-bold text-xl">
        Total Items: {totalItems} <br />
        Total Price: ₹{totalPrice.toFixed(2)}
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Back to Home
      </button>
    </div>
  );
};

export default OrderSuccess;
