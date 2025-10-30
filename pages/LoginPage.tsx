
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { BotIcon } from '../components/icons/BotIcon';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('client@saas.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <BotIcon className="h-12 w-12 text-brand-primary mx-auto" />
            <h1 className="text-3xl font-bold text-dark-text-primary mt-4">Welcome to WA Agent AI</h1>
            <p className="text-dark-text-secondary mt-2">Sign in to manage your autonomous agents.</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-dark-text-secondary">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-dark-text-secondary">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full bg-gray-900 border border-dark-border rounded-md shadow-sm py-2 px-3 text-dark-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        required
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>
            </form>
             <p className="mt-4 text-center text-xs text-dark-text-secondary">Use client@saas.com / password</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
