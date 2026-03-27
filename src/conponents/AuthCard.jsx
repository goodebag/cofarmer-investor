import React from 'react';
import { Feather } from 'lucide-react';

const AuthCard = ({ children, title }) => (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 animate-fadeIn">
            <div className="text-center mb-8">
                <Feather className="mx-auto text-green-600 w-12 h-12 mb-2"/>
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            </div>
            {children}
        </div>
    </div>
);

export default AuthCard;

