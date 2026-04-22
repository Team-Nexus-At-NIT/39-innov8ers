import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import api from '../lib/axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            content: 'Hello! I am your AI Agriculture Assistant. Ask me anything about farming in Maharashtra!',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false); // Voice state
    const [language, setLanguage] = useState('en'); // Language state: 'en', 'hi', 'mr'
    const messagesEndRef = useRef(null);
    const location = useLocation();

    const greetings = {
        en: 'Hello! I am your AI Agriculture Assistant. Ask me anything about farming in Maharashtra!',
        hi: 'नमस्ते! मैं आपका एआई कृषि सहायक हूं। मुझसे महाराष्ट्र में खेती के बारे में कुछ भी पूछें!',
        mr: 'नमस्कार! मी तुमचा एआय कृषी सहाय्यक आहे. महाराष्ट्रातील शेतीबद्दल मला काहीही विचारा!'
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Auto-scroll
    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Update greeting when language changes
    useEffect(() => {
        setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages.length > 0 && newMessages[0].type === 'bot') {
                newMessages[0].content = greetings[language];
            }
            return newMessages;
        });

        // Speak the new greeting if voice is enabled
        if (isVoiceEnabled) {
            speak(greetings[language]);
        }
    }, [language]);

    // Text-to-Speech Function with better voice selection
    const speak = (text) => {
        if (!isVoiceEnabled) return;
        window.speechSynthesis.cancel(); // Stop previous speech
        const utterance = new SpeechSynthesisUtterance(text);

        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;

        // Try to find specific high-quality voices
        if (language === 'hi') {
            utterance.lang = 'hi-IN';
            selectedVoice = voices.find(v => v.lang.includes('hi') && v.name.includes('Google')) ||
                voices.find(v => v.lang.includes('hi'));
        } else if (language === 'mr') {
            utterance.lang = 'mr-IN';
            selectedVoice = voices.find(v => v.lang.includes('mr') && v.name.includes('Google')) ||
                voices.find(v => v.lang.includes('mr'));
            // Fallback to Hindi voice if Marathi not found (often works better than English)
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.lang.includes('hi'));
            }
        } else {
            utterance.lang = 'en-IN';
            selectedVoice = voices.find(v => v.lang === 'en-IN' && v.name.includes('Google')) ||
                voices.find(v => v.lang === 'en-IN');
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.rate = 1; // 1.0 is normal speed
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    };

    // Stop speaking when voice is disabled
    useEffect(() => {
        if (!isVoiceEnabled) {
            window.speechSynthesis.cancel();
        }
    }, [isVoiceEnabled]);

    // Speak new bot messages
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.type === 'bot' && !lastMessage.isError && isVoiceEnabled) {
            speak(lastMessage.content);
        }
    }, [messages, isVoiceEnabled]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        setMessages((prev) => [...prev, { type: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await api.post('/chat', {
                message: userMessage,
                language: language, // Send selected language
            });

            if (response.data) {
                setMessages((prev) => [
                    ...prev,
                    { type: 'bot', content: response.data.reply || response.data.text },
                ]);
            } else {
                throw new Error('Failed to get response');
            }
        } catch (error) {
            console.error('Chatbot Error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    type: 'bot',
                    content: 'Sorry, I am having trouble connecting to the server. Please ensure the chatbot backend is running.',
                    isError: true,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (location.pathname !== '/') return null;

    return (
        <>
            {/* Floating Toggle Button - MOVED UP to bottom-24 to sit above Kisan Bandhu */}
            <motion.button
                className="fixed bottom-24 right-6 z-50 p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>

            {/* Chat Window - MOVED UP to bottom-40 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-40 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="bg-green-600 p-4 text-white flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageCircle size={20} />
                                    <h3 className="font-semibold text-lg">Agri-Bot</h3>
                                </div>

                                {/* Voice Toggle */}
                                <button
                                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                                    className="p-2 hover:bg-green-700 rounded-full transition-colors"
                                    title={isVoiceEnabled ? "Mute Voice" : "Enable Voice"}
                                >
                                    {isVoiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                </button>
                            </div>

                            {/* Language Selector */}
                            <div className="flex gap-2 text-xs">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-3 py-1 rounded-full transition-colors border border-white/30 ${language === 'en' ? 'bg-white text-green-700 font-bold' : 'bg-transparent text-white hover:bg-white/10'}`}
                                >
                                    ENG
                                </button>
                                <button
                                    onClick={() => setLanguage('hi')}
                                    className={`px-3 py-1 rounded-full transition-colors border border-white/30 ${language === 'hi' ? 'bg-white text-green-700 font-bold' : 'bg-transparent text-white hover:bg-white/10'}`}
                                >
                                    हिंदी
                                </button>
                                <button
                                    onClick={() => setLanguage('mr')}
                                    className={`px-3 py-1 rounded-full transition-colors border border-white/30 ${language === 'mr' ? 'bg-white text-green-700 font-bold' : 'bg-transparent text-white hover:bg-white/10'}`}
                                >
                                    मराठी
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.type === 'user'
                                            ? 'bg-green-600 text-white rounded-br-none'
                                            : msg.isError
                                                ? 'bg-red-100 text-red-800 rounded-bl-none'
                                                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                                        <Loader2 className="animate-spin text-green-600" size={20} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form
                            onSubmit={handleSendMessage}
                            className="p-4 bg-white border-t border-gray-100 flex gap-2"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask about farming..."
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !inputValue.trim()}
                                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;
