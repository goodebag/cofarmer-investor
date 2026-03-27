import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, TrendingUp, Shield, Globe, Award, Heart, DollarSign } from 'lucide-react';

const AboutUsPage = () => {
    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <section className="relative bg-green-900 text-white py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-slideInUp">
                        Cultivate Your Capital. <br />
                        <span className="text-yellow-400">Empower Local Farmers.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto mb-10 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
                        Join the ecosystem where capital meets opportunity. Earn up to 50% ROI while building a sustainable future for agriculture.
                    </p>
                    <div className="animate-slideInUp" style={{ animationDelay: '0.4s' }}>
                        <Link to="/signup" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 inline-block">
                            Start Investing Today
                        </Link>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            To democratize agricultural investment and empower local farmers through sustainable financing and guaranteed market access, creating a profitable ecosystem for all stakeholders.
                        </p>
                    </div>

                    <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Why CoFarmer Exists</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                CoFarmer is a premier agricultural crowdfunding platform designed to connect urban and diaspora investors directly with verified poultry farmers.
                            </p>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                We solve two critical challenges:
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="ml-3 text-gray-700">Lack of capital access for small-scale farmers who need resources to scale</span>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="ml-3 text-gray-700">Difficulty accessing reliable markets for produce after a successful harvest</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-green-50 p-8 rounded-2xl border border-green-100">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">How Your Investment Works</h3>
                            <p className="text-gray-600 mb-4">
                                When you invest, your capital provides farmers with essential inputs—day-old chicks, quality feed, and veterinary support.
                            </p>
                            <p className="text-gray-600">
                                After a successful 6-week growth cycle, we secure sales through our guaranteed distribution network, ensuring a profitable harvest and returns for you.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Benefits Grid */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Invest with CoFarmer?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We've created a win-win ecosystem designed for security, transparency, and profitability.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <TrendingUp className="w-8 h-8 text-yellow-500" />,
                                title: "High Returns",
                                desc: "Earn a competitive ROI of up to 50% per annum, significantly outperforming traditional savings accounts."
                            },
                            {
                                icon: <DollarSign className="w-8 h-8 text-yellow-500" />,
                                title: "Low Entry Barrier",
                                desc: "Diverse investment packages designed to be accessible for urban investors and the diaspora community."
                            },
                            {
                                icon: <Shield className="w-8 h-8 text-yellow-500" />,
                                title: "Guaranteed Market",
                                desc: "We don't just farm; we sell. Our established distribution network secures sales for every harvest."
                            },
                            {
                                icon: <Globe className="w-8 h-8 text-yellow-500" />,
                                title: "Complete Transparency",
                                desc: "Track your investment with full visibility throughout the entire farming cycle via your dashboard."
                            },
                            {
                                icon: <Heart className="w-8 h-8 text-yellow-500" />,
                                title: "Community Impact",
                                desc: "Your investment directly creates jobs, boosts local economies, and enhances food security."
                            },
                            {
                                icon: <Award className="w-8 h-8 text-yellow-500" />,
                                title: "Flexible Cashouts",
                                desc: "Access your capital and accumulated profits with a clear withdrawal process after the initial vesting period."
                            }
                        ].map((item, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                                <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-green-900 text-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to grow your wealth?</h2>
                    <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
                        Join CoFarmer today. Where Capital Meets Opportunity.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
                            Create Investor Account
                        </Link>
                        <Link to="/login" className="bg-transparent border-2 border-white hover:bg-white hover:text-green-900 text-white font-bold py-3 px-8 rounded-full transition-all duration-300">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUsPage;
