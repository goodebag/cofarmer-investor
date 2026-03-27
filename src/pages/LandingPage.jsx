import React from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, Briefcase, CheckCircle, FileText, Feather, TrendingUp } from 'lucide-react';

const LandingPage = () => {
    const StatCard = ({ icon, title, description }) => (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <div className="text-green-600 mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );

    return (
        <div className="animate-fadeIn">
            <section className="relative min-h-[90vh] bg-green-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10 pattern-grid-lg"></div>
                <div className="container mx-auto px-6 h-full py-12 lg:py-0">
                    <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[90vh]">
                        <div className="max-w-xl">
                            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4 animate-slideInUp">Cultivate Your Capital.</h2>
                            <p className="text-lg md:text-2xl mb-8 max-w-2xl animate-slideInUp" style={{ animationDelay: '0.2s' }}>
                                Invest in sustainable agriculture, empower local farmers, and earn up to a 50% annual return.
                            </p>
                            <div className="flex flex-wrap gap-4 animate-slideInUp" style={{ animationDelay: '0.4s' }}>
                                <Link to="/signup" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 inline-block text-center">
                                    Start Investing Today
                                </Link>
                                <a href="https://cofarmer.africa" className="bg-transparent border-2 border-white hover:bg-white hover:text-green-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 inline-block text-center">
                                    I am a Farmer
                                </a>
                            </div>
                        </div>
                        <div className="hidden lg:flex justify-center">
                            <img
                                src="https://res.cloudinary.com/dchg2nzjt/image/upload/v1757509533/Pointing_Image_7_ytgfyd.png"
                                alt="Professional pointing"
                                className="max-h-[80vh] object-contain object-center animate-slideInRight"
                                style={{ animationDelay: '0.6s' }}
                            />
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">How CoFarmer Works</h2>
                    <p className="text-gray-600 mb-12 max-w-3xl mx-auto">A simple and transparent process to multiply your capital while supporting real agricultural growth.</p>
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-green-50">
                            <div className="flex items-center justify-center h-20 w-20 mx-auto mb-6 bg-green-100 text-green-600 rounded-full text-3xl font-bold">1</div>
                            <h3 className="text-xl font-semibold mb-3">You Invest</h3>
                            <p className="text-gray-600">Choose an investment package and fund an upcoming poultry farm cycle safely through our platform.</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-green-50">
                            <div className="flex items-center justify-center h-20 w-20 mx-auto mb-6 bg-green-100 text-green-600 rounded-full text-3xl font-bold">2</div>
                            <h3 className="text-xl font-semibold mb-3">We Empower Farmers</h3>
                            <p className="text-gray-600">Your capital directly provides vetted farmers with day-old chicks, high-quality feed, and veterinary support.</p>
                        </div>
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-green-50">
                            <div className="flex items-center justify-center h-20 w-20 mx-auto mb-6 bg-green-100 text-green-600 rounded-full text-3xl font-bold">3</div>
                            <h3 className="text-xl font-semibold mb-3">You Earn Returns</h3>
                            <p className="text-gray-600">After the 6-week cycle and the sale of the produce, profits are shared—giving you up to a 50% ROI.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold">Why Invest through CoFarmer?</h2>
                        <p className="text-gray-600">Our platform brings security, high yields, and transparency to agritech investing.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <StatCard icon={<TrendingUp size={32} />} title="High Yields" description="Earn up to a 50% annual return on your investment, beating standard inflation and savings accounts." />
                        <StatCard icon={<CheckCircle size={32} />} title="Vetted Farms" description="We conduct rigorous KYC and in-person inspections. Only highly experienced farmers get funded." />
                        <StatCard icon={<FileText size={32} />} title="Transparent Tracking" description="Monitor your investment portfolio and track the 6-week farm progress through your dashboard." />
                        <StatCard icon={<Users size={32} />} title="Community Impact" description="Your capital creates jobs and significantly bolsters local food security within the community." />
                        <StatCard icon={<DollarSign size={32} />} title="Flexible Cashouts" description="Access your capital and your accumulated returns after the short 3-month vesting threshold." />
                        <StatCard icon={<Feather size={32} />} title="Sustainable Tech" description="We support sustainable farming practices using digital monitoring and superior veterinarian care." />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-br from-green-800 to-green-900 text-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Building True Wealth</h2>
                    <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
                        Put your money to work in the real economy. Invest in the future of sustainable food production.
                    </p>
                    <Link to="/signup" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-4 px-10 rounded-full shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg">
                        Create Your Investor Account
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
