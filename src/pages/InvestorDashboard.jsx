import React, { useState, useEffect } from 'react';
import { Briefcase, DollarSign, TrendingUp, Eye, X, Upload, Wallet, Building2 } from 'lucide-react';
import { useToast } from '../conponents/Toast.jsx';
import { apiFetch, apiUrl } from '../apiClient.js';

const InvestorDashboard = ({ token }) => {
    const [activeTab, setActiveTab] = useState('market'); // market | portfolio
    const [listings, setListings] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [summary, setSummary] = useState({ totalInvested: 0, currentBalance: 0, monthlyEarning: 0 });
    const [withdrawals, setWithdrawals] = useState([]);

    // Payment Settings from Backend
    const [paymentSettings, setPaymentSettings] = useState(null);

    // Investment Modal State
    const [showInvestModal, setShowInvestModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [investAmount, setInvestAmount] = useState(50000);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Payment Method State
    const [paymentMethod, setPaymentMethod] = useState('bank'); // 'bank' or 'crypto'
    const [proofFile, setProofFile] = useState(null);
    const [proofUrl, setProofUrl] = useState('');
    const [uploadingProof, setUploadingProof] = useState(false);

    // Crypto payment fields
    const [cryptoTxHash, setCryptoTxHash] = useState('');
    const [cryptoSenderAddress, setCryptoSenderAddress] = useState('');

    // Withdrawal State
    const [showWithdrawal, setShowWithdrawal] = useState(false);

    // Investment Detail Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState(null);

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const toast = useToast();

    async function loadData() {
        setLoading(true);
        try {
            const [lstData, invData, wdData, settingsData] = await Promise.all([
                apiFetch('/investor/listings', { token }),
                apiFetch('/investor/investments', { token }),
                apiFetch('/investor/withdrawals', { token }),
                apiFetch('/settings/payment-settings', {})
            ]);
            setListings(lstData);
            setInvestments(invData.investments);
            setSummary(invData.summary);
            setWithdrawals(wdData.withdrawals || []);
            setPaymentSettings(settingsData);

            // Set default payment method based on what's enabled
            if (settingsData.bankModule?.enabled) {
                setPaymentMethod('bank');
            } else if (settingsData.cryptoModule?.enabled) {
                setPaymentMethod('crypto');
            }
        } catch (e) { toast.push(e.message, 'error'); }
        setLoading(false);
    }

    useEffect(() => { loadData(); }, []);

    // Handle proof of payment upload
    async function handleProofUpload(file) {
        if (!file) return;
        setUploadingProof(true);
        try {
            const formData = new FormData();
            formData.append('proof', file);

            const response = await fetch(apiUrl('/upload/proof-of-payment'), {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setProofUrl(data.url);
                toast.push('Proof uploaded successfully!', 'success');
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (e) {
            toast.push(e.message || 'Failed to upload proof', 'error');
        }
        setUploadingProof(false);
    }

    const openInvestModal = (listing) => {
        setSelectedListing(listing);
        setInvestAmount(listing.minDeposit);
        setAgreedToTerms(false);
        // Reset payment fields
        setProofFile(null);
        setProofUrl('');
        setCryptoTxHash('');
        setCryptoSenderAddress('');
        if (paymentSettings?.bankModule?.enabled) {
            setPaymentMethod('bank');
        } else if (paymentSettings?.cryptoModule?.enabled) {
            setPaymentMethod('crypto');
        }
        setShowInvestModal(true);
    };

    async function submitInvestment(e) {
        e.preventDefault();
        setProcessing(true);
        try {
            const investmentData = {
                listingId: selectedListing._id,
                amount: Number(investAmount),
                paymentReference: selectedListing.title,
                paymentMethod,
                proofOfPayment: proofUrl || undefined
            };

            // Add crypto fields if using crypto payment
            if (paymentMethod === 'crypto') {
                investmentData.cryptoTxHash = cryptoTxHash;
                investmentData.cryptoSenderAddress = cryptoSenderAddress;
            }

            await apiFetch('/investor/invest', {
                method: 'POST',
                token,
                body: investmentData
            });
            toast.push('Investment submitted! Awaiting payment verification.', 'success');
            setShowInvestModal(false);
            loadData(); // Refresh data
            setActiveTab('portfolio');
        } catch (e) { toast.push(e.message, 'error'); }
        setProcessing(false);
    }

    // Calculate withdrawal eligibility and amounts
    function calculateWithdrawalDetails(investment) {
        if (!investment || !investment.listing) return null;

        const investedDate = new Date(investment.dateInvested);
        const now = new Date();
        const monthsElapsed = Math.floor((now - investedDate) / (1000 * 60 * 60 * 24 * 30));
        const minDuration = investment.listing.durationMonths;

        // Check if investment has reached minimum duration
        if (monthsElapsed < minDuration) {
            return {
                eligible: false,
                monthsElapsed,
                minDuration,
                remainingMonths: minDuration - monthsElapsed
            };
        }

        // Calculate ROI
        const totalROI = investment.listing.returnPercentage; // e.g., 50%
        const monthlyROI = totalROI / 12; // e.g., 50/12 = 4.17% per month
        const earnedROI = (monthlyROI * monthsElapsed) / 100; // Convert to decimal
        const roiAmount = Math.floor(investment.amount * earnedROI);
        const totalWithdrawal = investment.amount + roiAmount;

        return {
            eligible: true,
            monthsElapsed,
            minDuration,
            totalROI,
            monthlyROI,
            principalAmount: investment.amount,
            roiAmount,
            totalWithdrawal,
            investmentId: investment._id
        };
    }

    // Find eligible investments for withdrawal
    const eligibleInvestments = investments
        .map(inv => ({ ...inv, withdrawalDetails: calculateWithdrawalDetails(inv) }))
        .filter(inv => inv.withdrawalDetails?.eligible);

    const [selectedWithdrawalInvestment, setSelectedWithdrawalInvestment] = useState(null);

    function openWithdrawalModal(investment) {
        setSelectedWithdrawalInvestment(investment);
        setShowWithdrawal(true);
    }

    async function requestWithdrawal(e) {
        e.preventDefault();
        if (!selectedWithdrawalInvestment || !selectedWithdrawalInvestment.withdrawalDetails) return;

        const details = selectedWithdrawalInvestment.withdrawalDetails;
        const form = new FormData(e.target);
        const bankLabel = form.get('bankDetails');

        try {
            await apiFetch('/investor/withdrawals', {
                method: 'POST',
                token,
                body: {
                    investmentId: details.investmentId,
                    amount: details.totalWithdrawal,
                    principalAmount: details.principalAmount,
                    roiAmount: details.roiAmount,
                    monthsHeld: details.monthsElapsed,
                    bankLabel
                }
            });
            setShowWithdrawal(false);
            toast.push('Withdrawal requested successfully!', 'success');
            loadData();
        } catch (e) {
            toast.push(e.message || 'Withdrawal failed', 'error');
        }
    }

    const StatCard = ({ icon, title, value, color }) => (
        <div className={`bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 border-l-4 ${color}`}>
            <div className="text-2xl">{icon}</div>
            <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <p className="text-2xl font-bold text-gray-800">₦{Number(value).toLocaleString()}</p>
            </div>
        </div>
    );

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 animate-fadeIn relative">
            <h2 className="text-3xl font-bold mb-6">Investor Dashboard</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <StatCard icon={<Briefcase className="text-blue-500" />} title="Total Invested" value={summary.totalInvested} color="border-blue-500" />
                <StatCard icon={<DollarSign className="text-green-500" />} title="Est. Current Balance" value={summary.currentBalance} color="border-green-500" />
                <StatCard icon={<TrendingUp className="text-yellow-500" />} title="Proj. Monthly Earning" value={summary.monthlyEarning} color="border-yellow-500" />
            </div>

            <div className="mb-6 flex space-x-6 border-b">
                <button onClick={() => setActiveTab('market')} className={`pb-2 px-1 font-semibold ${activeTab === 'market' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>
                    Farm Marketplace
                </button>
                <button onClick={() => setActiveTab('portfolio')} className={`pb-2 px-1 font-semibold ${activeTab === 'portfolio' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>
                    My Portfolio
                </button>
            </div>

            {activeTab === 'market' && (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {listings.map(l => (
                        <div key={l._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="h-40 bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400">Farm Image Placeholder</span>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-gray-800">{l.title}</h3>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{l.status}</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">By {l.farmer?.name || 'Verified Farmer'}</p>

                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Target Return</p>
                                        <p className="font-bold text-green-600">{l.returnPercentage}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Duration</p>
                                        <p className="font-semibold">{l.durationMonths} Months</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Target</p>
                                        <p className="font-semibold">₦{(l.targetAmount / 1000000).toFixed(1)}M</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Min. Deposit</p>
                                        <p className="font-semibold">₦{l.minDeposit.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((l.raisedAmount / l.targetAmount) * 100, 100)}%` }}></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mb-4">
                                    <span>{((l.raisedAmount / l.targetAmount) * 100).toFixed(0)}% Raised</span>
                                    <span>Closes {new Date(l.fundingRoundCloseDate).toLocaleDateString()}</span>
                                </div>

                                <button onClick={() => openInvestModal(l)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors">
                                    Invest Now
                                </button>
                            </div>
                        </div>
                    ))}
                    {listings.length === 0 && <div className="col-span-full text-center py-10 text-gray-500">No active farm listings available at the moment.</div>}
                </div>
            )}

            {activeTab === 'portfolio' && (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-xl">My Investments</h3>
                            <div className="flex gap-2">
                                <select
                                    className="text-sm border rounded-lg px-3 py-1 bg-gray-50"
                                    onChange={(e) => {
                                        const filter = e.target.value;
                                        // Filter is handled via CSS display for simplicity
                                        document.querySelectorAll('.investment-item').forEach(el => {
                                            if (filter === 'all' || el.dataset.status === filter) {
                                                el.style.display = 'flex';
                                            } else {
                                                el.style.display = 'none';
                                            }
                                        });
                                    }}
                                >
                                    <option value="all">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {investments.map(inv => {
                                const approvalStatus = inv.approvalStatus || 'Confirmed'; // Backward compatibility
                                const statusColors = {
                                    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
                                    'Confirmed': 'bg-green-100 text-green-800 border-green-300',
                                    'Rejected': 'bg-red-100 text-red-800 border-red-300'
                                };
                                return (
                                    <div
                                        key={inv._id}
                                        data-status={approvalStatus}
                                        className={`investment-item p-4 border-2 rounded-lg flex justify-between items-center transition-colors ${approvalStatus === 'Pending' ? 'bg-yellow-50 border-yellow-200' :
                                            approvalStatus === 'Rejected' ? 'bg-red-50 border-red-200' :
                                                'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div>
                                            <p className="font-bold text-gray-800">{inv.listing?.title || 'General Pool'}</p>
                                            <p className="text-sm text-gray-500">Invested: ₦{inv.amount.toLocaleString()}</p>
                                            <p className="text-xs text-gray-400">{new Date(inv.dateInvested).toLocaleDateString()}</p>
                                            {approvalStatus === 'Rejected' && inv.rejectionReason && (
                                                <p className="text-xs text-red-600 mt-1">Reason: {inv.rejectionReason}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className={`inline-block mb-1 px-3 py-1 text-xs rounded-full font-semibold border ${statusColors[approvalStatus]}`}>
                                                    {approvalStatus === 'Pending' && '⏳ '}
                                                    {approvalStatus === 'Confirmed' && '✓ '}
                                                    {approvalStatus === 'Rejected' && '✗ '}
                                                    {approvalStatus}
                                                </span>
                                                {approvalStatus === 'Confirmed' && inv.listing && (
                                                    <p className="text-xs text-gray-600">Expected ROI: {inv.listing.returnPercentage}%</p>
                                                )}
                                            </div>
                                            {approvalStatus === 'Confirmed' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedInvestment(inv);
                                                        setShowDetailModal(true);
                                                    }}
                                                    className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {investments.length === 0 && <p className="text-sm text-gray-500">You haven't made any investments yet.</p>}
                        </div>

                        {/* Eligible Withdrawals Section */}
                        {eligibleInvestments.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-bold text-lg mb-3 text-green-700">✅ Eligible for Withdrawal</h4>
                                <div className="space-y-3">
                                    {eligibleInvestments.map(inv => {
                                        const details = inv.withdrawalDetails;
                                        return (
                                            <div key={inv._id} className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className="font-bold text-gray-800">{inv.listing?.title}</p>
                                                        <p className="text-sm text-gray-600">Invested: ₦{details.principalAmount.toLocaleString()}</p>
                                                        <p className="text-xs text-green-600 font-semibold">Duration: {details.monthsElapsed} months</p>
                                                    </div>
                                                    <button
                                                        onClick={() => openWithdrawalModal(inv)}
                                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                                    >
                                                        Withdraw
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-green-200">
                                                    <div>
                                                        <p className="text-xs text-gray-600">Principal</p>
                                                        <p className="font-bold">₦{details.principalAmount.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600">ROI Earned ({details.monthlyROI.toFixed(2)}%/mo × {details.monthsElapsed}mo)</p>
                                                        <p className="font-bold text-green-600">+₦{details.roiAmount.toLocaleString()}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-xs text-gray-600">Total Withdrawal Amount</p>
                                                        <p className="text-xl font-bold text-green-700">₦{details.totalWithdrawal.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="font-bold text-xl mb-4">Withdrawal History</h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {withdrawals.map(w => (
                                <div key={w._id} className="p-3 border rounded flex justify-between items-center text-sm">
                                    <span className="font-semibold">₦{w.amount.toLocaleString()}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${w.status === 'Approved' ? 'bg-green-100 text-green-800' : w.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{w.status}</span>
                                </div>
                            ))}
                            {withdrawals.length === 0 && <p className="text-gray-500 text-sm">No withdrawals found.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Invest Modal */}
            {showInvestModal && selectedListing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideInUp my-4">
                        <div className="p-6 border-b sticky top-0 bg-white z-10">
                            <h3 className="text-2xl font-bold">Invest in {selectedListing.title}</h3>
                            <p className="text-gray-500 text-sm">Target Return: {selectedListing.returnPercentage}% in {selectedListing.durationMonths} months</p>
                        </div>
                        <form onSubmit={submitInvestment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount (₦)</label>
                                <input
                                    type="number"
                                    min={selectedListing.minDeposit}
                                    value={investAmount}
                                    onChange={e => setInvestAmount(e.target.value)}
                                    className="w-full p-3 border rounded-lg text-lg font-semibold"
                                />
                                <p className="text-xs text-gray-500 mt-1">Minimum Deposit: ₦{selectedListing.minDeposit.toLocaleString()}</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-blue-800 text-sm mb-2">Projected Returns</h4>
                                <div className="flex justify-between text-sm">
                                    <span>At Maturity ({selectedListing.durationMonths} mo):</span>
                                    <span className="font-bold">₦{(Number(investAmount) * (1 + selectedListing.returnPercentage / 100)).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Payment Method Tabs */}
                            {paymentSettings && (paymentSettings.bankModule?.enabled || paymentSettings.cryptoModule?.enabled) && (
                                <div>
                                    <p className="font-semibold text-sm mb-3">Select Payment Method</p>
                                    <div className="flex gap-2 mb-4">
                                        {paymentSettings.bankModule?.enabled && (
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('bank')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${paymentMethod === 'bank'
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Building2 className="h-5 w-5" />
                                                <span className="font-semibold">Bank Transfer</span>
                                            </button>
                                        )}
                                        {paymentSettings.cryptoModule?.enabled && (
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('crypto')}
                                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${paymentMethod === 'crypto'
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                <Wallet className="h-5 w-5" />
                                                <span className="font-semibold">Crypto (USDT)</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Bank Module */}
                            {paymentMethod === 'bank' && paymentSettings?.bankModule?.enabled && (
                                <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
                                    <h4 className="font-semibold text-yellow-800 text-sm mb-3">💳 Bank Transfer Instructions</h4>
                                    <p className="text-xs text-yellow-700 mb-3">Transfer your investment amount to the account below:</p>
                                    <div className="bg-white p-3 rounded-lg border border-yellow-200 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-600">Bank:</span>
                                            <span className="font-bold text-gray-800">{paymentSettings.bankModule.bankName}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-600">Account Name:</span>
                                            <span className="font-bold text-gray-800 text-right text-sm">{paymentSettings.bankModule.accountName}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-600">Account No:</span>
                                            <span className="font-bold text-green-700 text-lg">{paymentSettings.bankModule.accountNumber}</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <span className="text-xs text-gray-600">Payment Description:</span>
                                            <p className="font-bold text-green-700">{selectedListing.title}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-yellow-700 mt-3">⚠️ Use the description above when making payment.</p>
                                </div>
                            )}

                            {/* Crypto Module */}
                            {paymentMethod === 'crypto' && paymentSettings?.cryptoModule?.enabled && (
                                <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-lg">
                                    <h4 className="font-semibold text-purple-800 text-sm mb-3">🪙 Crypto Payment ({paymentSettings.cryptoModule.currency})</h4>
                                    <p className="text-xs text-purple-700 mb-3">Send {paymentSettings.cryptoModule.currency} on {paymentSettings.cryptoModule.network} network:</p>

                                    {/* QR Code */}
                                    <div className="bg-white p-4 rounded-lg border border-purple-200 flex flex-col items-center mb-3">
                                        <div className="bg-white p-2 rounded-lg border-2 border-purple-200 mb-3">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${paymentSettings.cryptoModule.walletAddress}`}
                                                alt="Wallet QR Code"
                                                className="w-32 h-32"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1">Wallet Address:</p>
                                        <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all text-center select-all">
                                            {paymentSettings.cryptoModule.walletAddress}
                                        </p>
                                        <p className="text-xs text-purple-600 font-semibold mt-2">
                                            Network: {paymentSettings.cryptoModule.network}
                                        </p>
                                    </div>

                                    {/* Crypto Payment Fields */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-purple-800 mb-1">Transaction Hash *</label>
                                            <input
                                                type="text"
                                                value={cryptoTxHash}
                                                onChange={e => setCryptoTxHash(e.target.value)}
                                                placeholder="0x..."
                                                className="w-full p-2 border border-purple-200 rounded-lg text-sm font-mono"
                                                required={paymentMethod === 'crypto'}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-purple-800 mb-1">Sender Wallet Address *</label>
                                            <input
                                                type="text"
                                                value={cryptoSenderAddress}
                                                onChange={e => setCryptoSenderAddress(e.target.value)}
                                                placeholder="0x..."
                                                className="w-full p-2 border border-purple-200 rounded-lg text-sm font-mono"
                                                required={paymentMethod === 'crypto'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Proof of Payment Upload */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-700 text-sm mb-2">📎 Upload Proof of Payment</h4>
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
                                        <Upload className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm text-gray-600">
                                            {uploadingProof ? 'Uploading...' : proofUrl ? 'Change File' : 'Select File'}
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={e => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setProofFile(file);
                                                    handleProofUpload(file);
                                                }
                                            }}
                                            className="hidden"
                                            disabled={uploadingProof}
                                        />
                                    </label>
                                </div>
                                {proofUrl && (
                                    <div className="mt-2 flex items-center gap-2 text-green-600">
                                        <span className="text-xs">✓ Proof uploaded successfully</span>
                                        <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline">View</a>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-2">Supported: JPEG, PNG, GIF, WebP, PDF (max 5MB)</p>
                            </div>

                            <div className="border-t pt-4">
                                <p className="font-semibold text-sm mb-2">Terms & Conditions</p>
                                <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 h-24 overflow-y-auto mb-3">
                                    {selectedListing.agreementNote || 'Standard vesting terms apply.'}
                                    <br /><br />
                                    By clicking "I Agree", you acknowledge that we only guaranteed your capital in a case of bad cycle, although we do our best to vetting farms and guiding the farm cycles.
                                </div>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input type="checkbox" required checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="h-5 w-5 text-green-600 rounded" />
                                    <span className="text-sm font-medium text-gray-800">I Agree to the Vesting Terms</span>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setShowInvestModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={!agreedToTerms || processing || (paymentMethod === 'crypto' && (!cryptoTxHash || !cryptoSenderAddress))}
                                    className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Processing...' : 'Submit for Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showWithdrawal && selectedWithdrawalInvestment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg m-4">
                        <h3 className="font-bold text-2xl mb-2">Withdrawal Request</h3>
                        <p className="mb-6 text-gray-600">Investment: {selectedWithdrawalInvestment.listing?.title}</p>

                        {/* Withdrawal Calculation */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-5 mb-6">
                            <h4 className="font-bold text-lg mb-3 text-green-800">Withdrawal Breakdown</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Principal Amount:</span>
                                    <span className="font-bold text-lg">₦{selectedWithdrawalInvestment.withdrawalDetails.principalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-green-200 pt-2">
                                    <div>
                                        <span className="text-gray-700">ROI Earned:</span>
                                        <p className="text-xs text-gray-500">
                                            {selectedWithdrawalInvestment.withdrawalDetails.monthlyROI.toFixed(2)}% per month × {selectedWithdrawalInvestment.withdrawalDetails.monthsElapsed} months
                                        </p>
                                    </div>
                                    <span className="font-bold text-lg text-green-600">+₦{selectedWithdrawalInvestment.withdrawalDetails.roiAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center border-t-2 border-green-300 pt-3">
                                    <span className="font-bold text-gray-800">Total Withdrawal:</span>
                                    <span className="font-bold text-2xl text-green-700">₦{selectedWithdrawalInvestment.withdrawalDetails.totalWithdrawal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={requestWithdrawal}>
                            <div className="mb-6">
                                <label htmlFor="bankDetails" className="block text-sm font-medium text-gray-700 mb-2">Bank Details</label>
                                <select name="bankDetails" required className="mt-1 block w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500">
                                    <option value="">Select Bank Account</option>
                                    <option>GTBank - **** **** 1234</option>
                                    <option>Access Bank - **** **** 5678</option>
                                    <option>UBA - **** **** 9012</option>
                                </select>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ Your withdrawal request will be reviewed by our admin team. Once approved, funds will be transferred to your selected bank account.
                                </p>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button type="button" onClick={() => setShowWithdrawal(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition">Cancel</button>
                                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Investment Detail Modal */}
            {showDetailModal && selectedInvestment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold mb-1">Investment Details</h3>
                                    <p className="text-green-100 text-sm">Complete funding information</p>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Badge */}
                            <div className="flex justify-between items-center">
                                <span className={`px-4 py-2 text-sm font-bold rounded-full ${selectedInvestment.status === 'Active' ? 'bg-green-100 text-green-800' :
                                    selectedInvestment.status === 'Completed' ? 'bg-purple-100 text-purple-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {selectedInvestment.status}
                                </span>
                                <span className="text-gray-500 text-sm">
                                    Investment ID: {selectedInvestment._id}
                                </span>
                            </div>

                            {/* Investment Amount Card */}
                            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-700 font-medium mb-1">Investment Amount</p>
                                        <p className="text-4xl font-bold text-green-800">₦{selectedInvestment.amount.toLocaleString()}</p>
                                    </div>
                                    <DollarSign className="h-16 w-16 text-green-600 opacity-20" />
                                </div>
                            </div>

                            {/* Investment Date/Time */}
                            <div className="border rounded-lg p-5 bg-gray-50">
                                <h4 className="font-bold text-lg mb-3">Investment Information</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase mb-1">Investment Date</p>
                                        <p className="font-semibold">{new Date(selectedInvestment.dateInvested).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase mb-1">Time</p>
                                        <p className="font-semibold">{new Date(selectedInvestment.dateInvested).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Farm Listing Information */}
                            {selectedInvestment.listing ? (
                                <div className="border rounded-lg p-5 bg-gray-50">
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-green-600 font-bold text-sm">F</span>
                                        </div>
                                        Farm Listing Details
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase mb-1">Listing Title</p>
                                            <p className="font-bold text-lg text-green-700">{selectedInvestment.listing.title}</p>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase mb-1">Return (ROI)</p>
                                                <p className="text-xl font-bold text-blue-600">{selectedInvestment.listing.returnPercentage}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase mb-1">Duration</p>
                                                <p className="text-xl font-bold">{selectedInvestment.listing.durationMonths} Months</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase mb-1">Target Amount</p>
                                                <p className="text-xl font-bold">₦{selectedInvestment.listing.targetAmount?.toLocaleString() || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase mb-1">Farmer</p>
                                            <p className="font-semibold">{selectedInvestment.listing.farmer?.name || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">{selectedInvestment.listing.farmer?.farmId || ''}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase mb-1">Funding Progress</p>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(((selectedInvestment.listing.raisedAmount || 0) / (selectedInvestment.listing.targetAmount || 1)) * 100, 100)}%` }}></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>₦{selectedInvestment.listing.raisedAmount?.toLocaleString()} Raised</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-100 rounded text-gray-500 text-center">
                                    Listing details no longer available
                                </div>
                            )}

                            {/* Payment Proof Image */}
                            {selectedInvestment.proofOfPayment && (
                                <div className="border rounded-lg p-5 bg-gray-50">
                                    <h4 className="font-bold text-lg mb-3">Proof of Payment</h4>
                                    <div className="bg-white p-2 rounded border border-gray-200 inline-block">
                                        <a href={selectedInvestment.proofOfPayment} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={selectedInvestment.proofOfPayment}
                                                alt="Proof of Payment"
                                                className="max-h-64 object-contain rounded hover:opacity-90 transition-opacity"
                                            />
                                        </a>
                                        <p className="text-xs text-center text-gray-500 mt-1">Click to view full size</p>
                                    </div>
                                </div>
                            )}

                            {/* Rejection Details */}
                            {selectedInvestment.approvalStatus === 'Rejected' && (
                                <div className="bg-red-50 border border-red-200 p-5 rounded-lg">
                                    <h4 className="font-bold text-red-800 mb-2">Investment Rejected</h4>
                                    <p className="text-red-700">{selectedInvestment.rejectionReason || 'No reason provided.'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvestorDashboard;
