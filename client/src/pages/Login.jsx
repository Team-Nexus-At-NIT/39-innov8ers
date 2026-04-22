import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Leaf } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = await login(formData.email, formData.password);
            toast.success('Logged in successfully!');

            // Redirect based on role
            if (userData?.role === 'admin') {
                navigate('/admin/data');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop')" }}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

            <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10 border border-white/20">
                <div className="flex justify-center mb-8">
                    <Link to="/" className="flex items-center space-x-2 text-green-700 font-bold text-2xl">
                        <Leaf className="h-8 w-8" />
                        <span>Kisan Bandhu</span>
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">{t('Welcome Back')}</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('Email Address')}</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white/50 focus:bg-white"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('Password')}</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white/50 focus:bg-white"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-md transform hover:scale-[1.02]"
                    >
                        {t('Sign In')}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600">
                    {t('Don\'t have an account?')}{' '}
                    <Link to="/register" className="text-green-600 font-bold hover:text-green-700 hover:underline">
                        {t('Create Account')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
