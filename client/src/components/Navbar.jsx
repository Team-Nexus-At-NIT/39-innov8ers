import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="flex flex-col w-full shadow-md z-[100] relative">
            {/* Top Bar - Gov Style accessibility & utility */}
            <div className="bg-gray-100 text-gray-700 text-[11px] py-1 px-4 md:px-8 flex justify-between items-center border-b border-gray-200">
                <div className="flex space-x-4">
                    <span className="font-bold">{t('govt_initiative')}</span>
                    <span className="hidden md:inline">{t('ministry')}</span>
                </div>
                <div className="flex items-center space-x-3 divide-x divide-gray-300">
                    <a href="#content" className="pl-3 hover:text-blue-600">Skip to Main Content</a>
                    <span className="pl-3 flex items-center space-x-1">
                        <span className="font-bold">A+</span>
                        <span>A</span>
                        <span className="text-xs">A-</span>
                    </span>
                    <div id="google_translate_element" className="pl-3"></div>

                </div>
            </div>

            {/* Main Header - Logos and Branding */}
            <div className="bg-white py-3 px-4 md:px-8 border-b-4 border-orange-500 flex justify-between items-center">
                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* Emblem - Placeholder URL */}
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Gov Emblem" className="h-10 md:h-14 w-auto drop-shadow-sm" />
                    <div className="block">
                        <h1 className="text-lg md:text-2xl font-black text-gray-800 leading-none tracking-tight">Kisan <span className="text-green-600">Bandhu</span></h1>
                        <p className="hidden md:block text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase mt-1">{t('unified_portal')}</p>
                    </div>
                </div>

                {/* Right side logos */}
                <div className="flex items-center space-x-3 md:space-x-6">
                    <div className="text-right">
                        <img src="https://flagcdn.com/w160/in.png" className="h-6 md:h-8 shadow-sm border border-gray-200" alt="Indian Flag" />
                    </div>
                    <div className="text-right hidden md:block lg:block">
                        <p className="text-xs font-bold text-gray-500 uppercase">{t('kisan_call_center')}</p>
                        <p className="text-xl font-extrabold text-green-700">1800-180-1551</p>
                    </div>
                    {/* Mobile Menu Toggle replaced Flag space */}
                    <button
                        className="md:hidden text-gray-700 p-2 z-50 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <Menu className="w-7 h-7" />
                    </button>
                </div>
            </div>

            {/* Navigation Bar (Hidden on Mobile) */}
            <nav className="hidden md:block bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white px-4 md:px-8 shadow-lg relative">
                <div className="flex justify-between items-center py-2 md:py-0">
                    <ul className="flex flex-row space-x-8 font-medium text-[15px]">
                        <li><Link to="/" className="block py-4 px-3 hover:bg-white/10 transition border-b-4 border-transparent hover:border-yellow-400">{t('Home')}</Link></li>
                        <li><Link to="/about" className="block py-4 px-3 hover:bg-white/10 transition border-b-4 border-transparent hover:border-yellow-400">{t('About Us')}</Link></li>
                        <li><Link to="/market" className="block py-4 px-3 hover:bg-white/10 transition border-b-4 border-transparent hover:border-yellow-400">{t('mandi_prices')}</Link></li>
                        <li className="relative group">
                            <a href="#" className="block py-4 px-3 hover:bg-white/10 transition border-b-4 border-transparent hover:border-yellow-400">{t('services')} ▾</a>
                            {/* Mega Menu Dropdown */}
                            <div className="absolute left-0 top-full w-48 bg-white text-gray-800 shadow-xl rounded-b-lg hidden group-hover:block transition-all duration-200 border-t-2 border-yellow-400">
                                <Link to="/schemes" className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100">{t('Schemes')}</Link>
                                <Link to="/register" className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-100">{t('register_farm')}</Link>
                                <Link to="/dashboard/marketplace" className="block px-4 py-3 hover:bg-gray-50">{t('Marketplace')}</Link>
                            </div>
                        </li>
                        <li><Link to="/contact" className="block py-4 px-3 hover:bg-white/10 transition border-b-4 border-transparent hover:border-yellow-400">{t('Contact')}</Link></li>
                    </ul>

                    {/* Right Aligned Login/Register Desktop */}
                    <div className="flex items-center space-x-3 ml-auto text-sm">
                        {user ? (
                            <Link to="/dashboard" className="px-3 py-1.5 bg-yellow-400 text-blue-900 font-bold rounded shadow hover:bg-yellow-300 transition flex items-center">
                                <User className="w-4 h-4 mr-1" /> <span>{t('Dashboard')}</span>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="px-3 py-1.5 border border-white/50 rounded hover:bg-white/10 transition font-medium whitespace-nowrap">{t('login')}</Link>
                                <Link to="/register" className="px-3 py-1.5 bg-yellow-400 text-blue-900 font-bold rounded shadow hover:bg-yellow-300 transition whitespace-nowrap">{t('register')}</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Glassmorphism Mobile Sidebar Drawer */}
            {isMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}

            <div className={`md:hidden fixed top-0 right-0 h-full w-[280px] bg-blue-900/95 backdrop-blur-xl border-l border-blue-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Sidebar Header */}
                <div className="flex justify-between items-center p-5 border-b border-blue-800 bg-blue-950/50 rounded-tl-2xl">
                    <h2 className="text-xl font-bold text-white">Menu</h2>
                    <button onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:bg-white/10 hover:text-white rounded-full p-2 transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Sidebar Links */}
                <div className="flex-1 overflow-y-auto py-4 px-3 text-gray-200 font-medium">
                    <ul className="space-y-1">
                        <li><Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-white/10 hover:text-yellow-400 transition-colors">{t('Home')}</Link></li>
                        <li><Link to="/about" onClick={() => setIsMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-white/10 hover:text-yellow-400 transition-colors">{t('About Us')}</Link></li>
                        <li><Link to="/market" onClick={() => setIsMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-white/10 hover:text-yellow-400 transition-colors">{t('mandi_prices')}</Link></li>

                        {/* Mobile Dropdown Group */}
                        <li className="py-2 px-4">
                            <span className="block text-blue-300 text-sm font-semibold uppercase tracking-wider mb-2 mt-2">{t('services')}</span>
                            <div className="space-y-1 ml-2 border-l-2 border-blue-800 pl-3">
                                <Link to="/schemes" onClick={() => setIsMenuOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-white/10 hover:text-yellow-400 transition-colors">{t('Schemes')}</Link>
                                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-white/10 hover:text-yellow-400 transition-colors">{t('register_farm')}</Link>
                                <Link to="/dashboard/marketplace" onClick={() => setIsMenuOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-white/10 hover:text-yellow-400 transition-colors">{t('Marketplace')}</Link>
                            </div>
                        </li>

                        <li><Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-white/10 hover:text-yellow-400 transition-colors">{t('Contact')}</Link></li>
                    </ul>
                </div>

                {/* Sidebar Footer Login/Register */}
                <div className="p-5 border-t border-blue-800 bg-blue-950/80 backdrop-blur-md">
                    {user ? (
                        <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                            <User className="w-5 h-5 mr-2" /> {t('Dashboard')}
                        </Link>
                    ) : (
                        <div className="flex flex-col space-y-3">
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center w-full py-2.5 px-4 bg-transparent text-white border-2 border-white/30 font-bold rounded-xl shadow-sm hover:border-white hover:bg-white/10 transition-all">
                                {t('login')}
                            </Link>
                            <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center w-full py-2.5 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                                {t('register')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
