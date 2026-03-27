import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../conponents/AuthCard';

const SignInPage = ({ onLogin, currentUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (currentUser) {
            navigate('/dashboard', { replace: true });
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const success = await onLogin(email, password);
        if (!success) setError('Invalid email or password or validation failed.');
        setLoading(false);
    };

    return (
        <AuthCard title="Welcome Back">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-center">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600 space-y-2">
                <span className="block">Don't have an account? <button onClick={() => navigate('/signup')} className="font-medium text-green-600 hover:text-green-500">Sign up</button></span>
                <span className="block"><button onClick={() => navigate('/forgot-password')} className="text-green-600 hover:text-green-500">Forgot password?</button></span>
            </p>
        </AuthCard>
    );
};

export default SignInPage;

