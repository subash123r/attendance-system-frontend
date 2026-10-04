import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "https://attendance-system-backend-bbl8.onrender.com";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!formData.name || !formData.email || !formData.password) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/signup`,
        formData
      );

      setMessage(response.data.message || "Account created successfully!");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
  console.error("Signup error:", error);

  console.log("Backend response:", error.response?.data);

  setMessage(
    error.response?.data?.message ||
    "Signup failed. Please try again."
  );
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Account
        </h1>

        <p className="text-center text-gray-500 mb-8">
          Register as an employee
        </p>

        <form onSubmit={handleSignup} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message */}
          {message && (
            <p className="text-center text-sm text-blue-600 font-medium">
              {message}
            </p>
          )}

          {/* Signup */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Login */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </button>
        </p>

      </div>
    </div>
  );
}

export default Signup;