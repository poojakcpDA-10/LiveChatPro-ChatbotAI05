import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user'); // purely cosmetic
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

 const onSubmit = async (data) => {
  try {
    
    const isSales = role === 'sales';

    const { token, user } = await login(data, isSales); 
    
      localStorage.setItem('token', token);
      localStorage.setItem('role', isSales ? 'sales' : 'user');
         localStorage.setItem(isSales ? 'salesUser' : 'user', JSON.stringify(user));

    toast.success('Login successful!');
    onSuccess?.();
  } catch (error) {
   const serverMessage =
      error?.response?.data?.message || 'Login failed. Please try again.';
    toast.error(serverMessage);
  }
};


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Login as
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="user">User</option>
          <option value="sales">Salesperson</option>
        </select>
        <p className="text-xs text-gray-400 mt-1">
          Role is automatically verified from your account.
        </p>
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email'
            }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={false}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Sign In
      </button>
    </form>
  );
};

export default LoginForm;
