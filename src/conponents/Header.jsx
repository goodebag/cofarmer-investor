import React from 'react';
import { Link } from 'react-router-dom';
import { Feather, LogIn, UserPlus, LogOut } from 'lucide-react';

const Header = ({ user, onLogout, showMobileMenu, setShowMobileMenu }) => {
    const NavLink = ({ children, to, onClick }) => (
        <Link
            to={to}
            onClick={onClick}
            className="text-white hover:text-yellow-300 transition-colors duration-300 font-medium tracking-wide py-2"
        >
            {children}
        </Link>
    );

    return (
        <header className="bg-green-800 bg-opacity-95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2 cursor-pointer">
                    <Feather className="text-yellow-400 w-8 h-8" />
                    <h1 className="text-2xl font-bold text-white tracking-wider">CoFarmer</h1>
                </Link>
                <div className="hidden md:flex items-center space-x-6">
                    {user ? (
                        <>
                            <span className="text-yellow-300">Welcome, {user.name}</span>
                            <NavLink to="/dashboard">Dashboard</NavLink>
                            <button onClick={onLogout} className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded-full transition-all duration-300">
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <a href="https://cofarmer.africa" className="text-white hover:text-yellow-300 transition-colors duration-300 font-medium tracking-wide py-2">Farmer Portal</a>
                            <Link to="/login" className="flex items-center space-x-2 text-white hover:text-yellow-300">
                                <LogIn size={18} />
                                <span>Sign In</span>
                            </Link>
                            <Link to="/signup" className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded-full transition-all duration-300">
                                <UserPlus size={18} />
                                <span>Sign Up</span>
                            </Link>
                        </>
                    )}
                </div>
                <div className="md:hidden">
                    <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="text-white focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    </button>
                </div>
            </nav>
            {showMobileMenu && (
                <div className="md:hidden bg-green-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
                        {user ? (
                            <>
                                <NavLink to="/dashboard" onClick={() => setShowMobileMenu(false)}>Dashboard</NavLink>
                                <button onClick={() => { onLogout(); setShowMobileMenu(false); }} className="text-white hover:text-yellow-300 font-medium py-2">Logout</button>
                            </>
                        ) : (
                            <>
                                <a href="https://cofarmer.africa" className="text-white hover:text-yellow-300 font-medium tracking-wide py-2">Farmer Portal</a>
                                <NavLink to="/login" onClick={() => setShowMobileMenu(false)}>Sign In</NavLink>
                                <NavLink to="/signup" onClick={() => setShowMobileMenu(false)}>Sign Up</NavLink>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
