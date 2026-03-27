import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../conponents/AuthCard';
import { useToast } from '../conponents/Toast';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  async function submit(e) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/reset`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
      const data = await res.json();
      if (res.ok) { toast.push('Password updated', 'success'); navigate('/login'); }
      else toast.push(data.message || 'Reset failed', 'error');
    } catch { toast.push('Network error', 'error'); }
    setLoading(false);
  }

  return (
    <AuthCard title="Set New Password">
      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Reset Token</label>
          <input value={token} onChange={e => setToken(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <button disabled={loading} className="w-full py-3 rounded-full bg-green-600 text-white font-semibold disabled:opacity-50">{loading ? 'Updating...' : 'Update Password'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        <button onClick={() => navigate('/login')} className="text-green-600">Back to Sign In</button>
      </p>
    </AuthCard>
  );
}
