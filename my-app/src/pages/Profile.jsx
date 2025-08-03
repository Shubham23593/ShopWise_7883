import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/"); // user नाही -> home ला
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed!");
      console.error(err);
    }
  };

  if (!user) return null;

  // Get initials
  const initials = user.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-sm text-center transform hover:scale-105 transition-transform duration-300">
        <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {initials}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">My Profile</h2>
        <p className="text-sm text-gray-500 mb-6">Welcome to your dashboard</p>

        <div className="text-left space-y-2">
          <p>
            <span className="font-semibold">Email:</span>{" "}
            <span className="text-gray-700">{user.email}</span>
          </p>
          {user.displayName && (
            <p>
              <span className="font-semibold">Name:</span>{" "}
              <span className="text-gray-700">{user.displayName}</span>
            </p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded shadow"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
