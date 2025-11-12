
import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      onLogin(email);
    } else {
      setError('Please enter a valid email address.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-stump-white">AI Cricket Scorer</h1>
          <p className="mt-2 text-gray-400">Log in to track your matches</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-bold text-gray-300 tracking-wider">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('');
              }}
              className="mt-2 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-stump-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cricket-green focus:border-cricket-green"
              placeholder="you@example.com"
            />
             {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-stump-white bg-cricket-green hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cricket-green transition duration-150 ease-in-out"
          >
            Log In / Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
