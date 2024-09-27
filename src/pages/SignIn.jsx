import React, { useState } from "react";
import { signIn } from "@/utils/auth";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="px-8 py-6 mt-4 text-left bg-gray-800 shadow-lg rounded-lg"
      >
        <h3 className="text-2xl font-bold text-center text-white mb-4">Sign in to your account</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block text-gray-300" htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-brown-500 bg-gray-700 text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-300">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-brown-500 bg-gray-700 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-baseline justify-between mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 text-white bg-gradient-to-r from-brown-500 to-black-600 rounded-lg hover:from-brown-600 hover:to-black-700 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:ring-opacity-50"
              >
                Sign In
              </motion.button>
            </div>
          </div>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <p className="mt-4 text-gray-300">
          Don't have an account?{" "}
          <Link to="/sign-up" className="text-brown-400 hover:text-brown-300">
            Sign up here
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SignIn;