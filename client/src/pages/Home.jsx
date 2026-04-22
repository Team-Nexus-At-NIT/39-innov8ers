import { Link, useNavigate } from 'react-router-dom';
import AgriBot from '../components/AgriBot';
import { ArrowRight, Leaf, ShieldCheck, TrendingUp, Users, Sprout, Building2, Bell, Calendar, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import PriceTicker from '../components/PriceTicker';
import NewsWidget from '../components/dashboard/NewsWidget';
import YoutubeWidget from '../components/dashboard/YoutubeWidget';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Home = () => {
    // ... setup and motion variables
    const { t } = useTranslation();

    const fadeIn = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const scaleUp = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            {/* 1. Market Rates Ticker (Highest Priority) */}
            <PriceTicker />

            {/* 2. Government Alerts Ticker */}
            <div className="bg-orange-50 border-b border-orange-200 text-xs md:text-sm py-2 overflow-hidden flex items-center">
                <span className="bg-red-600 text-white font-bold px-3 py-1 ml-4 rounded-sm uppercase tracking-wider text-[10px] md:text-xs shrink-0 animate-pulse">New Alerts</span>
                <div className="flex-1 overflow-hidden relative mx-4">
                    <div className="animate-marquee whitespace-nowrap flex space-x-12 font-medium text-gray-800">
                        <span>🔴 PM-Kisan 14th Installment Released - Check Status</span>
                        <span>🔴 New MSP Rates Announced for Kharif Crops 2026</span>
                        <span>🔴 Digital Crop Survey starting in 150 Districts</span>
                        <span>🔴 Heavy Rainfall Alert for Coastal Districts</span>
                    </div>
                </div>
            </div>

            {/* Professional Hero Section */}
            <div className="relative h-[600px] w-full bg-slate-900 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop"
                        alt="Indian Agriculture"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="max-w-2xl text-white space-y-6"
                    >
                        <motion.div variants={fadeIn} className="inline-block bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 text-yellow-300">
                            Digital India Initiative - V2
                        </motion.div>
                        <motion.h1 variants={fadeIn} className="text-5xl md:text-6xl font-serif font-bold leading-tight">
                            Contract Farming <br />
                            <span className="text-green-400">Simplified & Secure</span>
                        </motion.h1>
                        <motion.p variants={fadeIn} className="text-lg md:text-xl text-gray-200 font-light leading-relaxed">
                            Connecting 12 Crore farmers with trusted buyers through a transparent, legal, and AI-enabled digital framework.
                        </motion.p>

                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link to="/register" className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg shadow-lg hover:shadow-green-500/30 transition transform hover:-translate-y-1">
                                {t('Register Farmer / Buyer')} <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link to="/schemes" className="flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white font-bold rounded-lg transition hover:-translate-y-1">
                                <Award className="mr-2 h-5 w-5" /> {t('View Schemes')}
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Floating Stats Bar */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6, type: "spring", bounce: 0.3 }}
                    className="absolute bottom-0 w-full bg-green-900/90 backdrop-blur-md border-t border-green-700 py-6 hidden md:block"
                >
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-4 gap-8 text-center divide-x divide-green-700">
                        <div>
                            <p className="text-3xl font-bold text-white">1.2 Cr+</p>
                            <p className="text-xs text-green-200 uppercase tracking-widest mt-1">Beneficiaries</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">₹ 450 Cr</p>
                            <p className="text-xs text-green-200 uppercase tracking-widest mt-1">Contracts Value</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">850+</p>
                            <p className="text-xs text-green-200 uppercase tracking-widest mt-1">FPOs Onboarded</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">24/7</p>
                            <p className="text-xs text-green-200 uppercase tracking-widest mt-1">Kisan Support</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* About Us Layout */}
            <div className="py-16 lg:py-24 bg-white overflow-hidden border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left: Image with Decorative Leaves */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl aspect-[4/5] md:aspect-square bg-gray-200 border-4 border-white">
                            <img src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2071&auto=format&fit=crop" alt="Indian Farmer" className="w-full h-full object-cover" />
                        </div>
                        {/* Decorative Leaf Icon */}
                        <div className="absolute -left-12 -bottom-12 md:-left-16 md:-bottom-16 z-20 text-green-600/30 drop-shadow-2xl pointer-events-none transform -rotate-12">
                            <Leaf className="w-32 h-32 md:w-48 md:h-48 fill-current stroke-[1.5]" />
                        </div>
                    </motion.div>

                    {/* Right: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 font-serif leading-tight">
                            About Us – <br className="hidden lg:block" /> <span className="text-[#0f5132]">Kisan Bandhu</span>
                        </h2>

                        <p className="text-gray-600 text-lg leading-relaxed font-medium">
                            Kisan Bandhu is a digital platform designed to support farmers with modern agricultural knowledge, AI-powered guidance, and market opportunities. Our goal is to bridge the gap between farmers, advanced farming practices, and reliable buyers.
                        </p>

                        <div className="flex items-end gap-3 mt-8 mb-6 border-l-4 border-[#4CAF50] pl-5 py-1">
                            <span className="text-5xl md:text-6xl font-black text-[#4CAF50] tracking-tighter leading-none">10M+</span>
                            <div className="text-xs font-black text-gray-800 leading-tight uppercase tracking-widest pb-1">
                                Farmers<br />Empowered
                            </div>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid sm:grid-cols-2 gap-4 md:gap-6 mt-8">
                            {/* Card 1: Yellow/Orange */}
                            <div className="bg-[#F6BA5A] p-6 lg:p-8 rounded-xl text-gray-900 shadow-sm hover:-translate-y-1 transition-transform border border-[#f3ad43]">
                                <div className="bg-white/30 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center mb-5 border-2 border-white/50 shadow-sm">
                                    <Sprout className="w-6 h-6 text-gray-900 stroke-[2.5]" />
                                </div>
                                <h4 className="font-bold text-lg mb-2 leading-tight">AI-Powered<br />Guidance</h4>
                                <p className="text-xs font-bold text-gray-800/80 leading-relaxed">
                                    Guidance on crop planning, techniques, and seasonal recommendations to maximize yield.
                                </p>
                            </div>

                            {/* Card 2: Green */}
                            <div className="bg-[#41A559] p-6 lg:p-8 rounded-xl text-white shadow-sm hover:-translate-y-1 transition-transform border border-[#3b9651]">
                                <div className="bg-black/10 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center mb-5 border-2 border-white/20 shadow-sm">
                                    <ShieldCheck className="w-6 h-6 text-white stroke-[2.5]" />
                                </div>
                                <h4 className="font-bold text-lg mb-2 leading-tight">Trusted Market<br />Opportunities</h4>
                                <p className="text-xs font-bold text-white/90 leading-relaxed">
                                    Connecting farmers with reliable buyers to ensure fair prices and reduce uncertainty.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* DD Kisan YouTube Integration (Horizontal Scroll) */}
            <YoutubeWidget />

            {/* Main Content Layout - News & Services */}
            <div className="py-16 bg-gray-50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-12">

                    {/* Left Column: Services & Announcements */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Mission & Vision Section (Restored) */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={slideInLeft}
                            className="relative rounded-2xl shadow-xl overflow-hidden border border-gray-200"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=2070&auto=format&fit=crop"
                                    alt="Farm Background"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-transparent"></div>
                            </div>

                            <div className="relative p-8 md:p-10 z-10 text-white">
                                <div className="flex items-center mb-6">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="h-16 mr-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] invert" alt="National Emblem of India" />
                                    <div>
                                        <h2 className="text-3xl font-bold font-serif mb-1">Mission & Vision</h2>
                                        <p className="text-xs text-orange-400 uppercase tracking-[0.2em] font-bold">Ministry of Agriculture & Farmers Welfare</p>
                                    </div>
                                </div>
                                <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-green-500 rounded-full mb-6"></div>
                                <div className="space-y-6 text-gray-100 text-base md:text-lg leading-relaxed text-justify font-light backdrop-blur-sm bg-black/20 p-6 rounded-xl border border-white/10 shadow-inner">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 flex items-center"><span className="mr-2">🌱</span> Our Mission</h3>
                                        <p>
                                            Our mission is to empower farmers by providing AI-driven guidance, reliable agricultural information, and direct market connections. <strong className="text-white font-medium">Kisan Bandhu</strong> aims to support farmers in making better farming decisions, improving crop productivity, and gaining access to fair and stable market opportunities through contract farming and technology-driven solutions.
                                        </p>
                                    </div>
                                    <div className="w-full h-px bg-white/20"></div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 flex items-center"><span className="mr-2">🚜</span> Our Vision</h3>
                                        <p>
                                            Our vision is to create a smart and digitally connected agricultural ecosystem where farmers have easy access to knowledge, technology, and markets. <strong className="text-white font-medium">Kisan Bandhu</strong> strives to build a future where every farmer can increase income, adopt modern farming practices, and achieve sustainable agricultural growth.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Core Services Grid */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={staggerContainer}
                        >
                            <motion.h3 variants={fadeIn} className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <div className="w-2 h-8 bg-green-600 mr-3 rounded-sm"></div>
                                Citizen Services
                            </motion.h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    { icon: ShieldCheck, title: "Price Assurance", desc: "Guaranteed price mechanisms via legal contracts.", color: "blue" },
                                    { icon: Sprout, title: "Crop Advisory", desc: "Scientific cultivation practices for higher yield.", color: "green" },
                                    { icon: Building2, title: "Institutional Credit", desc: "Access to loans based on contract value.", color: "purple" },
                                    { icon: TrendingUp, title: "Market Linkage", desc: "Direct selling to food processors and exporters.", color: "orange" },
                                ].map((service, idx) => (
                                    <motion.div
                                        key={idx}
                                        variants={scaleUp}
                                        whileHover={{ scale: 1.03, y: -5 }}
                                        className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                                    >
                                        <div className={`w-12 h-12 bg-${service.color}-100 rounded-lg flex items-center justify-center text-${service.color}-600 mb-4 group-hover:scale-110 transition`}>
                                            <service.icon className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-bold text-gray-900 mb-2">{service.title}</h4>
                                        <p className="text-sm text-gray-600">{service.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: News & Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="lg:col-span-1 space-y-8"
                    >
                        {/* News Widget Container */}
                        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden h-[600px] flex flex-col hover:shadow-2xl transition-shadow duration-300">
                            <NewsWidget />
                        </div>

                        {/* Quick Links */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-blue-900 text-white rounded-xl p-6 shadow-lg hover:shadow-blue-900/40 transition-all duration-300"
                        >
                            <h4 className="font-bold text-lg mb-4 flex items-center border-b border-blue-700 pb-2">
                                <Bell className="w-5 h-5 mr-2" /> Important Links
                            </h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-yellow-300 flex items-center transition-colors">➜ E-NAM Portal</a></li>
                                <li><a href="#" className="hover:text-yellow-300 flex items-center transition-colors">➜ PM-Kisan Website</a></li>
                                <li><a href="#" className="hover:text-yellow-300 flex items-center transition-colors">➜ Soil Health Card</a></li>
                                <li><a href="#" className="hover:text-yellow-300 flex items-center transition-colors">➜ Download Mobile App</a></li>
                            </ul>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Schemes Section - Govt Style Cards */}
            <div className="bg-gray-100 py-16 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-orange-600 font-bold tracking-widest uppercase text-xs">Empowering Annadata</span>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mt-2">Government Schemes</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-orange-500 via-white to-green-500 mx-auto mt-4 rounded-full"></div>
                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {[
                            { title: "PM Fasal Bima Yojana", desc: "Comprehensive crop insurance scheme to protect against yield losses.", active: true },
                            { title: "Agri Infrastructure Fund", desc: "Financing facility for post-harvest management projects.", active: true },
                            { title: "Paramparagat Krishi Vikas", desc: "Promotion of organic farming through cluster approach.", active: false },
                        ].map((scheme, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeIn}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="bg-white rounded-lg shadow-sm hover:shadow-2xl transition-all duration-300 border-l-4 border-green-600 overflow-hidden group cursor-pointer"
                            >
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-green-700 transition">{scheme.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{scheme.desc}</p>
                                    <div className="flex justify-between items-center">
                                        <Link to="/schemes" className="text-green-600 font-bold text-sm hover:underline">Read More &rarr;</Link>
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${scheme.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {scheme.active ? 'Active' : 'Closed'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        className="text-center mt-10"
                    >
                        <Link to="/schemes" className="inline-block px-8 py-3 bg-blue-900 text-white font-bold rounded shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all hover:-translate-y-1">View All Schemes Directory</Link>
                    </motion.div>
                </div>
            </div>

            {/* Footer - Govt Standard */}
            <footer className="bg-gray-900 text-gray-300 text-sm py-12 border-t-4 border-yellow-500">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
                    <div>
                        <h5 className="text-white font-bold uppercase mb-4">Kisan Bandhu</h5>
                        <p className="mb-4">An initiative by Ministry of Agriculture to modernize farming contracts.</p>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="h-16 opacity-50 invert" alt="Emblem" />
                    </div>
                    <div>
                        <h5 className="text-white font-bold uppercase mb-4">Usefull Links</h5>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-white">Copyright Policy</a></li>
                            <li><a href="#" className="hover:text-white">Hyperlinking Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white font-bold uppercase mb-4">Contact Us</h5>
                        <p>Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001</p>
                        <p className="mt-2">Email: help@kisanbandhu.gov.in</p>
                        <p>Phone: 1800-180-1551</p>
                    </div>
                    <div>
                        <h5 className="text-white font-bold uppercase mb-4">Accessibility</h5>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-white">Screen Reader Access</a></li>
                            <li><a href="#" className="hover:text-white">High Contrast Mode</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-800 text-center text-xs">
                    <p>© 2026 Kisan Bandhu. Designed & Developed by NIC (Simulation).</p>
                    <p className="mt-2 text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>
            </footer>
            <AgriBot />
        </div>
    );
};

export default Home;
