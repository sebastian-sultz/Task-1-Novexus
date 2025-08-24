import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { RiMailLine, RiLock2Line, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import Button from '../Common/Button';
import StarBorder from '../Common/StarBorder';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to log in');
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/30">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="h-16 w-16 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mx-auto mb-4">
                <span className="text-white font-bold text-xl">PM</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Welcome Back
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                Sign in to access your account
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-5 sm:gap-6">
              {/* Email Field */}
              <div className="relative grid grid-cols-1 gap-2 border-b-2 border-indigo-200 group">
                <div className="flex items-center">
                  <RiMailLine className="text-gray-600 text-lg sm:text-xl" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Email..."
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
                    placeholder="Enter Password..."
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

              {/* Remember me and Forgot password */}
              {/* <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-600"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="#"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div> */}

              {/* Submit Button */}
              <div>
                <StarBorder as='button'
                  type="submit"
                  loading={loading}
                  className='w-full'
                >
                  Sign In
                </StarBorder>
              </div>
            </form>

            {/* Signup Redirect */}
            <div className="mt-5 sm:mt-6 text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;