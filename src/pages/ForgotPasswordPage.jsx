import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../conponents/AuthCard';
import { useToast } from '../conponents/Toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [tokenDev, setTokenDev] = useState(null); // show returned token in dev for testing
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  async function submit(e) {
    e.preventDefault(); setLoading(true); setTokenDev(null);
    try {
      const res = await fetch(`${apiBase}/auth/forgot`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      if (res.ok) { toast.push('If account exists, email sent', 'success'); if (data.token) setTokenDev(data.token); }
      else toast.push('Request failed', 'error');
    } catch { toast.push('Network error', 'error'); }
    setLoading(false);
  }

  return (
    <AuthCard title="Reset Password">
      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <button disabled={loading} className="w-full py-3 rounded-full bg-green-600 text-white font-semibold disabled:opacity-50">{loading ? 'Sending...' : 'Send Reset Link'}</button>
      </form>
      {tokenDev && <p className="mt-4 text-xs break-all text-gray-500">Dev Token: {tokenDev}</p>}
      <p className="mt-6 text-center text-sm text-gray-600">
        Remembered? <button onClick={() => navigate('/login')} className="text-green-600">Sign In</button>
      </p>
    </AuthCard>
  );
}
