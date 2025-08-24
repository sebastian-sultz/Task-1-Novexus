import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { RiMailLine, RiLock2Line, RiEyeLine, RiEyeOffLine, RiUserLine } from 'react-icons/ri';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      const result = await register(name, email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to create an account');
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 md:py-24 bg-gradient-to-br from-gray-50 to-indigo-100">
      <div className="w-full max-w-[90%] sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/30">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="h-16 w-16 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mb-4">
                <span className="text-white font-bold text-xl">PM</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Create Account
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                Sign up to get started
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-5 sm:gap-6">
              {/* Name Field */}
              <div className="relative grid grid-cols-1 gap-2 border-b-2 border-indigo-200 group">
                <div className="flex items-center">
                  <RiUserLine className="text-gray-600 text-lg sm:text-xl" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none focus:placeholder-transparent text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="absolute -bottom-px left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>

              {/* Email Field */}
              <div className="relative grid grid-cols-1 gap-2 border-b-2 border-indigo-200 group">
                <div className="flex items-center">
                  <RiMailLine className="text-gray-600 text-lg sm:text-xl" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none focus:placeholder-transparent text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="absolute -bottom-px left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>

              {/* Password Field */}
              <div className="relative grid grid-cols-1 gap-2 border-b-2 border-indigo-200 group">
                <div className="flex items-center">
                  <RiLock2Line className="text-gray-600 text-lg sm:text-xl" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none focus:placeholder-transparent text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-600 hover:text-indigo-600"
                  >
                    {showPassword ? (
                      <RiEyeLine className="text-lg sm:text-xl cursor-pointer" />
                    ) : (
                      <RiEyeOffLine className="text-lg sm:text-xl cursor-pointer" />
                    )}
                  </button>
                </div>
                <div className="absolute -bottom-px left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.01] disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>

            {/* Login Redirect */}
            <div className="mt-5 sm:mt-6 text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;