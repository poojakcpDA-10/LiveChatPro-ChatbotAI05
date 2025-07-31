import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import toast from 'react-hot-toast';

const RegisterForm = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, loading, error } = useAuth();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('Registration successful!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          type="text"
          {...register('username', { 
            required: 'Username is required',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters'
            }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Choose a username"
        />
        {errors.username && (
          <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
        )}
      </div>

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('password', { 
              required: 'Password is required',
              pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{6,}$/,
                  message: 'Must contain upper, lower, number & special character'},
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            placeholder="Create a password"
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

      <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Confirm Password
  </label>
  <div className="relative">
    <input
      type={showConfirmPassword ? 'text' : 'password'}
      {...register('confirmPassword', { 
        required: 'Please confirm your password',
        validate: value => value === password || 'Passwords do not match'
      })}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
      placeholder="Confirm your password"
    />
    <button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
    >
      {showConfirmPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  </div>
  {errors.confirmPassword && (
    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
  )}
</div>


      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default RegisterForm;