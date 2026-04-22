const Demand = require('../models/Demand');
const Scheme = require('../models/Scheme');
const asyncHandler = require('../middleware/async');

// @desc    Handle Chat Interaction
// @route   POST /api/chat
// @access  Public
// @desc    Handle Chat Interaction
// @route   POST /api/chat
// @access  Public
const axios = require('axios');

// ... (existing imports are fine, but axios is new)

exports.handleChat = asyncHandler(async (req, res, next) => {
    const { message, language = 'en' } = req.body;

    // 1. Try Python Backend (Advanced AI)
    try {
        const pythonResponse = await axios.post('http://localhost:8000/api/chat', {
            message,
            language
        });

        // Python backend returns { reply, confidence, status: "success" }
        if (pythonResponse.data && pythonResponse.data.reply) {
            return res.status(200).json({
                success: true,
                text: pythonResponse.data.reply,
                type: 'text',
                language
            });
        }
    } catch (error) {
        console.warn("Python backend offline or error:", error.message);
        // Fallback to Node.js logic below...
    }

    // 2. Fallback: Node.js Simple Logic
    if (!message) {
        return res.status(400).json({ success: false, text: "Please say something!" });
    }

    const lowerMsg = message.toLowerCase();
    let responseText = "";
    let data = null;
    let type = "text"; // text, contracts, schemes, options

    // Translations
    const trans = {
        en: {
            greeting: "Namaste! 🙏 I am Kisan Bandhu. I can help you find high-value contracts, government schemes, or market prices. What are you looking for today?",
            noContracts: "Currently, there are no open contracts listed. Please check back later or try checking schemes.",
            foundContracts: (count) => `I found ${count} active contracts for you! Here are the latest ones:`,
            foundSchemes: "Here are the latest government schemes for you:",
            noSchemes: "I couldn't find any active schemes at the moment.",
            marketPrompt: "You can view real-time Mandi prices on our Market page. Would you like me to take you there?",
            marketLabel: "Go to Market Prices",
            fallback: "I'm still learning! You can ask me about 'Contracts', 'Schemes', or 'Market Prices'.",
            options: {
                contracts: "Show New Contracts",
                schemes: "Active Government Schemes",
                market: "Market Prices"
            }
        },
        hi: {
            greeting: "नमस्ते! 🙏 मैं किसान बंधु हूं। मैं आपको उच्च मूल्य वाले अनुबंध, सरकारी योजनाएं, या मंडी भाव खोजने में मदद कर सकता हूं। आज आप क्या ढूंढ रहे हैं?",
            noContracts: "वर्तमान में कोई खुले अनुबंध सूचीबद्ध नहीं हैं। कृपया बाद में जांचें या योजनाएं देखें।",
            foundContracts: (count) => `मुझे आपके लिए ${count} सक्रिय अनुबंध मिले हैं! यहाँ नवीनतम हैं:`,
            foundSchemes: "यहाँ आपके लिए नवीनतम सरकारी योजनाएं हैं:",
            noSchemes: "मुझे इस समय कोई सक्रिय योजना नहीं मिली।",
            marketPrompt: "आप हमारे बाजार पृष्ठ पर वास्तविक समय मंडी भाव देख सकते हैं। क्या आप वहां जाना चाहेंगे?",
            marketLabel: "मंडी भाव देखें",
            fallback: "मैं अभी भी सीख रहा हूं! आप मुझसे 'अनुबंध', 'योजनाएं', या 'मंडी भाव' के बारे में पूछ सकते हैं।",
            options: {
                contracts: "नये अनुबंध दिखाएं",
                schemes: "सरकारी योजनाएं",
                market: "मंडी भाव"
            }
        },
        mr: {
            greeting: "नमस्कार! 🙏 मी किसान बंधू आहे. मी तुम्हाला कंत्राटी शेती, सरकारी योजना किंवा बाजार भाव शोधण्यात मदत करू शकतो. आज तुम्ही काय शोधत आहात?",
            noContracts: "सध्या कोणतेही सक्रिय कंत्राट उपलब्ध नाहीत. कृपया नंतर तपासा किंवा योजना पहा.",
            foundContracts: (count) => `मला तुमच्यासाठी ${count} सक्रिय कंत्राटे सापडली आहेत! हे आहेत नवीनतम:`,
            foundSchemes: "येथे तुमच्यासाठी नवीनतम सरकारी योजना आहेत:",
            noSchemes: "मला सध्या कोणत्याही सक्रिय योजना सापडल्या नाहीत.",
            marketPrompt: "तुम्ही आमच्या मार्केट पेजवर रियल-टाइम बाजार भाव पाहू शकता. तुम्हाला तिथे जायचे आहे का?",
            marketLabel: "बाजार भाव पहा",
            fallback: "मी अजूनही शिकत आहे! तुम्ही मला 'कंत्राट', 'योजना', किंवा 'बाजार भाव' बद्दल विचारू शकता.",
            options: {
                contracts: "नवीन कंत्राटे दाखवा",
                schemes: "सरकारी योजना",
                market: "बाजार भाव"
            }
        }
    };

    const t = trans[language] || trans['en'];

    // Intent Analysis (Multilingual Keywords)
    const isGreeting = ['hi', 'hello', 'start', 'नमस्ते', 'नमस्कार', 'राम राम'].some(w => lowerMsg.includes(w));
    const isContracts = ['contract', 'demand', 'sell', 'buyer', 'अनुबंध', 'ठेका', 'कंत्राट', 'विकणे', 'करार'].some(w => lowerMsg.includes(w));
    const isSchemes = ['scheme', 'govt', 'subsidy', 'loan', 'योजना', 'सरकार', 'सब्सिडी', 'कर्ज', 'अनुदान'].some(w => lowerMsg.includes(w));
    const isMarket = ['price', 'market', 'mandi', 'भाव', 'मंडी', 'बजार', 'दर'].some(w => lowerMsg.includes(w));

    if (isGreeting) {
        responseText = t.greeting;
        type = "options";
        data = { labels: t.options }; // Send translated labels
    }
    else if (isContracts) {
        // Fetch Contracts
        const contracts = await Demand.find({ status: 'Open' })
            .select('cropName quantityRequired pricePerTon buyer contractType')
            .sort('-createdAt')
            .limit(5)
            .populate('buyer', 'name');

        if (contracts.length > 0) {
            responseText = t.foundContracts(contracts.length);
            data = contracts;
            type = "contracts";
        } else {
            responseText = t.noContracts;
        }
    }
    else if (isSchemes) {
        // Fetch Schemes
        const schemes = await Scheme.find({ isActive: true })
            .select('title provider description applicationLink')
            .sort('-createdAt')
            .limit(3);

        if (schemes.length > 0) {
            responseText = t.foundSchemes;
            data = schemes;
            type = "schemes";
        } else {
            responseText = t.noSchemes;
        }
    }
    else if (isMarket) {
        responseText = t.marketPrompt;
        type = "link";
        data = { url: "/market", label: t.marketLabel };
    }
    else {
        responseText = t.fallback;
        type = "options";
        data = { labels: t.options };
    }

    res.status(200).json({
        success: true,
        text: responseText,
        data: data,
        type: type,
        language: language
    });
});
