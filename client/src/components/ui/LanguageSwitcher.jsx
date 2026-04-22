import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ta', name: 'தமிழ்' },
];

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="relative group">
            <button className="flex items-center space-x-1 text-sm font-medium hover:text-green-200 transition">
                <Globe className="h-4 w-4" />
                <span>{languages.find(l => l.code === i18n.language)?.name || 'Language'}</span>
            </button>

            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl py-2 hidden group-hover:block border z-50">
                {languages.map((lng) => (
                    <button
                        key={lng.code}
                        onClick={() => changeLanguage(lng.code)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-gray-700 ${i18n.language === lng.code ? 'font-bold text-green-700' : ''}`}
                    >
                        {lng.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSwitcher;
