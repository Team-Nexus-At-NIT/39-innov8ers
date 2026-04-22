import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, ChevronRight, FileText, Sparkles } from 'lucide-react';
import api from '../lib/axios'; // Ensure this points to your axios instance
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AgriBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]); // Initialized via useEffect
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('en'); // 'en', 'hi', 'mr'
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Initial Greetings
    const initialGreetings = {
        en: "Namaste! 🙏 I am Kisan Bandhu. How can I help you regarding farming contracts today?",
        hi: "नमस्ते! 🙏 मैं किसान बंधु हूं। आज मैं आपकी खेती और अनुबंधों में कैसे मदद कर सकता हूं?",
        mr: "नमस्कार! 🙏 मी किसान बंधू आहे. आज मी तुम्हाला शेती आणि कंत्राटांबाबत कशी मदत करू शकतो?"
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Reset/Update greeting when language changes if no other messages
        if (messages.length <= 1) {
            setMessages([{
                id: 1,
                sender: 'bot',
                text: initialGreetings[language],
                type: 'options',
                data: {
                    labels: {
                        contracts: language === 'hi' ? "नये अनुबंध दिखाएं" : language === 'mr' ? "नवीन कंत्राटे दाखवा" : "Show New Contracts",
                        schemes: language === 'hi' ? "सरकारी योजनाएं" : language === 'mr' ? "सरकारी योजना" : "Active Government Schemes",
                        market: language === 'hi' ? "मंडी भाव" : language === 'mr' ? "बाजार भाव" : "Market Prices"
                    }
                }
            }]);
        }
    }, [language]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        // User Message
        const userMsg = { id: Date.now(), sender: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await api.post('/chat', { message: text, language });

            // Bot Response
            const botMsg = {
                id: Date.now() + 1,
                sender: 'bot',
                text: data.text,
                type: data.type,
                data: data.data
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: language === 'hi' ? 'क्षमा करें, मुझे सर्वर से कनेक्ट करने में समस्या हो रही है।' : language === 'mr' ? 'क्षमस्व, मला सर्व्हरशी कनेक्ट करण्यात अडचण येत आहे.' : 'Sorry, I am having trouble connecting to the server. Please try again later.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionClick = (option) => {
        handleSend(option);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[350px] md:w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 pb-3 text-white">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Kisan Bandhu AI</h3>
                                    <div className="flex items-center gap-1.5 opacity-80">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] font-medium">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Language Toggles */}
                        <div className="flex gap-2 justify-center">
                            {['en', 'hi', 'mr'].map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase transition ${language === lang
                                        ? 'bg-white text-emerald-700 shadow-sm'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                        }`}
                                >
                                    {lang === 'en' ? 'ENG' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 bg-gray-50 overflow-y-auto p-4 content-start">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                                    ? 'bg-emerald-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    {msg.text}

                                    {/* DATA RENDER: Contracts */}
                                    {msg.type === 'contracts' && msg.data?.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {msg.data.map(contract => (
                                                <div key={contract._id} onClick={() => {
                                                    if (user) {
                                                        navigate('/dashboard/marketplace');
                                                    } else {
                                                        toast.error("Please login to view full contract details");
                                                        navigate('/login');
                                                    }
                                                }} className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 hover:border-emerald-300 cursor-pointer transition flex items-center justify-between group">
                                                    <div>
                                                        <div className="font-bold text-emerald-800 text-xs">{contract.cropName}</div>
                                                        <div className="text-[10px] text-gray-500">{contract.quantityRequired} Tons • ₹{contract.pricePerTon}/t</div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* DATA RENDER: Schemes */}
                                    {msg.type === 'schemes' && msg.data?.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {msg.data.map(scheme => (
                                                <div key={scheme._id} onClick={() => navigate('/schemes')} className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 hover:bg-blue-100 cursor-pointer transition">
                                                    <div className="font-bold text-blue-800 text-xs">{scheme.title}</div>
                                                    <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{scheme.description}</div>
                                                    <div className="text-[9px] text-blue-600 font-bold mt-1 uppercase text-right">Apply Now &rarr;</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* DATA RENDER: Link */}
                                    {msg.type === 'link' && msg.data && (
                                        <button onClick={() => navigate(msg.data.url)} className="mt-2 text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition w-full">
                                            {msg.data.label}
                                        </button>
                                    )}

                                    {/* OPTIONS CHIPS */}
                                    {msg.type === 'options' && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button onClick={() => handleOptionClick(msg.data?.labels?.contracts || "Show New Contracts")} className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1.5 rounded-full border border-emerald-100 hover:bg-emerald-100 transition">{msg.data?.labels?.contracts || "Show New Contracts"}</button>
                                            <button onClick={() => handleOptionClick(msg.data?.labels?.schemes || "Active Government Schemes")} className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition">{msg.data?.labels?.schemes || "Govt Schemes"}</button>
                                            <button onClick={() => handleOptionClick(msg.data?.labels?.market || "Market Prices")} className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2.5 py-1.5 rounded-full border border-amber-100 hover:bg-amber-100 transition">{msg.data?.labels?.market || "Market Prices"}</button>
                                        </div>
                                    )}

                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex items-center gap-1 text-gray-400 ml-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-100 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                            />
                            <button type="submit" disabled={!input.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed">
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-gradient-to-r from-emerald-500 to-green-600'}`}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <div className="relative">
                        <Sparkles className="w-6 h-6 text-white animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-green-600"></span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default AgriBot;
