import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logOut, isLoggedIn } from "@/utils/auth"; // Add import for isLoggedIn
import { motion } from "framer-motion";

export function Navbar({ routes }) {
  const navigate = useNavigate();
  const disableAnonymous = import.meta.env.VITE_DISABLE_ANONYMOUS === "true";

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/sign-in");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex justify-end items-center w-full">
      {isLoggedIn() ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="px-4 py-2 text-white bg-gradient-to-r from-red-500 to-black-600 rounded-lg hover:from-brown-600 hover:to-black-700 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:ring-opacity-50"
        >
          Logout
        </motion.button>
      ) : (
        !disableAnonymous && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/sign-in")}
            className="px-4 py-2 text-white bg-gradient-to-r from-brown-500 to-brown-600 rounded-lg hover:from-brown-600 hover:to-brown-700 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:ring-opacity-50"
          >
            Login
          </motion.button>
        )
      )}
    </div>
  );
}
