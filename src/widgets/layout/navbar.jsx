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
    <div className="flex w-full items-center justify-end gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.open("https://xuntun.site/", "_blank")}
        className="flex items-center rounded-lg bg-gradient-to-r from-brown-500 to-brown-600 px-4 py-2 text-white hover:from-brown-600 hover:to-brown-700 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:ring-opacity-50"
      >
        IT service
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ml-1 h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </motion.button>
      {isLoggedIn() ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="to-black-600 hover:to-black-700 rounded-lg bg-gradient-to-r from-red-500 px-4 py-2 text-white hover:from-brown-600 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:ring-opacity-50"
        >
          Logout
        </motion.button>
      ) : (
        !disableAnonymous && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/sign-in")}
            className="rounded-lg bg-gradient-to-r from-brown-500 to-brown-600 px-4 py-2 text-white hover:from-brown-600 hover:to-brown-700 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:ring-opacity-50"
          >
            Login
          </motion.button>
        )
      )}
    </div>
  );
}
