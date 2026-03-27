import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useToast } from './conponents/Toast.jsx';
import { apiFetch } from './apiClient.js';

import Header from './conponents/Header';
import Footer from './conponents/Footer';

import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import InvestorDashboard from './pages/InvestorDashboard';

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
}

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        const stored = localStorage.getItem('cofarmer_auth');
        if (stored) {
            try {
                const { user, token } = JSON.parse(stored);
                // On investor app side, we should only allow investors (and maybe admins)
                if (user.role === 'investor' || user.role === 'admin') {
                    setCurrentUser(user);
                    setToken(token);
                }
            } catch { }
        }
    }, []);

    function persist(user, token) {
        localStorage.setItem('cofarmer_auth', JSON.stringify({ user, token }));
    }

    async function handleLogin(email, password) {
        try {
            let data;
            try {
                data = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
            } catch (e) {
                toast.push(e.message, 'error');
                return false;
            }
            if (data.user.role !== 'investor' && data.user.role !== 'admin') {
                toast.push('Unauthorized! App reserved for investors.', 'error');
                return false;
            }
            setCurrentUser(data.user);
            setToken(data.token);
            persist(data.user, data.token);
            navigate('/dashboard');
            toast.push('Logged in securely', 'success');
            return true;
        } catch {
            toast.push('Network error', 'error');
            return false;
        }
    }

    async function handleSignUp(newUser) {
        try {
            let data;
            try {
                // newUser already contains role='investor'
                data = await apiFetch('/auth/register', { method: 'POST', body: { ...newUser } });
            } catch (e) {
                toast.push(e.message, 'error');
                return false;
            }
            setCurrentUser(data.user);
            setToken(data.token);
            persist(data.user, data.token);
            navigate('/dashboard');
            toast.push('Investor account created!', 'success');
            return true;
        } catch {
            toast.push('Network error', 'error');
            return false;
        }
    }

    function handleLogout() {
        setCurrentUser(null);
        setToken(null);
        localStorage.removeItem('cofarmer_auth');
        navigate('/');
        toast.push('Logged out');
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex flex-col">
            <ScrollToTop />
            <Header
                user={currentUser}
                onLogout={handleLogout}
                showMobileMenu={showMobileMenu}
                setShowMobileMenu={setShowMobileMenu}
            />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<SignInPage onLogin={handleLogin} currentUser={currentUser} />} />
                    <Route path="/signup" element={<SignUpPage onSignUp={handleSignUp} currentUser={currentUser} />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/dashboard" element={
                        currentUser ? <InvestorDashboard user={currentUser} token={token} /> : <Navigate to="/login" replace />
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}
