import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../conponents/AuthCard';

const SignUpPage = ({ onSignUp, currentUser }) => {
    const [name, setName] = useState('');
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
        // hardcode role to 'investor' for the investor app
        const success = await onSignUp({ name, email, role: 'investor', password });
        if (!success) setError('Unable to create investor account');
        setLoading(false);
    };

    return (
        <AuthCard title="Create Investor Account">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-center">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" />
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    {loading ? 'Creating...' : 'Create Account'}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account? <button type="button" onClick={() => navigate('/login')} className="font-medium text-green-600 hover:text-green-500">Sign In</button>
            </p>
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">Are you a farmer? <a href="https://cofarmer.africa" className="font-medium text-green-700 hover:text-green-600">Go to Farmer Portal</a></p>
            </div>
        </AuthCard>
    );
};

export default SignUpPage;
