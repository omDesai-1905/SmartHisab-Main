import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CustomerLogin = () => {
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/api/customer-portal/login",
        {
          customerId,
          password,
        }
      );

      localStorage.setItem("customerToken", response.data.token);
      localStorage.setItem("customerData", JSON.stringify(response.data.customer));
      
      navigate("/customerpanel/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-4 relative overflow-hidden">
      
      {/* Login Card */}
      <div className="bg-white p-12 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-[480px] relative z-[1]">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-[#7ab4cd] tracking-tight">
            Customer Portal
          </h1>
          <p className="text-base text-gray-500 font-medium">
            Welcome back! Please login to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 px-5 py-4 bg-gradient-to-r from-red-100 to-red-200 border-l-4 border-red-500 rounded-xl flex items-center gap-3 animate-[shake_0.5s_ease]">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-900 font-semibold text-[0.95rem] m-0">
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Customer ID Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Customer ID
            </label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full py-4 pl-5 pr-4 border-2 border-gray-200 rounded-xl text-base font-medium outline-none transition-all bg-gray-50 focus:border-[#7ab4cd] focus:bg-white focus:shadow-[0_0_0_4px_rgba(122,180,205,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Enter your ID"
                required
                disabled={loading}
              />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Password
            </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-4 pl-5 pr-4 border-2 border-gray-200 rounded-xl text-base font-medium outline-none transition-all bg-gray-50 focus:border-[#667eea] focus:bg-white focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Enter your password"
                required
                disabled={loading}
              />

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-4 ${
              loading ? 'bg-[#7ab4cd]/60 cursor-not-allowed shadow-none' : 'bg-[#7ab4cd] cursor-pointer shadow-[0_10px_30px_rgba(122,180,205,0.4)] hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(122,180,205,0.5)]'
            } text-white border-none rounded-xl text-lg font-bold transition-all mt-2 flex items-center justify-center gap-3`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <span className="text-xl">→</span>
              </>
            )}
          </button>
        </form>

        {/* Info Box */}
        
      </div>
    </div>
  );
};

export default CustomerLogin;
