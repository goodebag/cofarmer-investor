import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail } from 'lucide-react';

const Footer = () => (
    <footer className="bg-green-900 text-white">
        <div className="container mx-auto px-6 py-8">
            <div className="grid md:grid-cols-3 gap-8">
                <div>
                    <h3 className="font-bold text-xl mb-4">CoFarmer</h3>
                    <p className="text-gray-300">Cultivating capital, empowering farmers, and growing a sustainable future together.</p>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        <li><Link to="/" className="hover:text-yellow-400 cursor-pointer">Home</Link></li>
                        <li><Link to="/partner" className="hover:text-yellow-400 cursor-pointer">Partner With Us</Link></li>
                        <li><Link to="/contact" className="hover:text-yellow-400 cursor-pointer">Contact Us</Link></li>
                        <li><Link to="/login" className="hover:text-yellow-400 cursor-pointer">Investor Portal</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-4">Connect</h3>
                    <div className="flex flex-col space-y-3">
                        <a
                            href="https://wa.me/+2348156684102"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-yellow-400 inline-flex items-center space-x-2"
                        >
                            <MessageSquare size={20} />
                            <span>WhatsApp Us</span>
                        </a>
                        <Link
                            to="/contact"
                            className="hover:text-yellow-400 inline-flex items-center space-x-2 cursor-pointer"
                        >
                            <Mail size={20} />
                            <span>Email Us</span>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="mt-8 border-t border-green-800 pt-6 text-center text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} CoFarmer. All rights reserved. Enugu, Nigeria.</p>
            </div>
        </div>
    </footer>
);

export default Footer;

