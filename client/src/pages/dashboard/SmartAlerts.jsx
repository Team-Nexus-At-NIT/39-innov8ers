import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { CloudRain, Sun, Wind, Droplets, AlertTriangle, ShieldCheck, Thermometer, Satellite, Activity, Info, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const SmartAlerts = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchWeather = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/weather');
            if (data.success) {
                setData(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather();
    }, []);

    const handleUpdateLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        const loadingToast = toast.loading("Getting your location...");

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { longitude, latitude } = position.coords;
                // Update Backend
                await api.put('/auth/location', {
                    coordinates: [longitude, latitude]
                });

                toast.success("Location updated! Refreshing weather...", { id: loadingToast });

                // Refresh Weather
                fetchWeather();

            } catch (error) {
                console.error(error);
                toast.error("Failed to update location", { id: loadingToast });
            }
        }, (error) => {
            console.error(error);
            toast.error("Unable to retrieve your location", { id: loadingToast });
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    );

    const getRiskColor = (level) => {
        switch (level) {
            case 'Low': return 'text-green-600 bg-green-50 border-green-200';
            case 'Moderate': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'High': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getWeatherIcon = (condition) => {
        if (!condition) return <Sun className="w-8 h-8 text-yellow-500" />;
        if (condition.includes('Rain') || condition.includes('Storm')) return <CloudRain className="w-8 h-8 text-blue-500" />;
        if (condition.includes('Cloud')) return <Wind className="w-8 h-8 text-gray-500" />;
        return <Sun className="w-8 h-8 text-yellow-500" />;
    };

    return (
        <div className="space-y-6">
            <header className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Risk & Weather Intelligence</h1>
                    <p className="text-gray-500 mt-2">Real-time satellite insights and predictive alerts for your farm.</p>
                </div>
                <button
                    onClick={handleUpdateLocation}
                    className="flex items-center space-x-2 bg-white text-green-700 px-4 py-2 rounded-lg font-bold shadow-sm border border-green-200 hover:bg-green-50 transition"
                >
                    <MapPin className="w-4 h-4" />
                    <span>Update My Location</span>
                </button>
            </header>

            {/* Risk Score & Overview */}
            <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`col-span-1 p-6 rounded-2xl border-2 flex flex-col justify-center items-center shadow-lg ${getRiskColor(data?.risk?.level)}`}
                >
                    <div className="relative">
                        <Activity className="w-16 h-16 opacity-20 absolute -top-4 -left-8 animate-pulse" />
                        <h2 className="text-xl font-bold uppercase tracking-wider mb-2">Crop Risk Score</h2>
                    </div>
                    <div className="text-6xl font-black my-4">{data?.risk?.score}<span className="text-2xl font-medium text-opacity-60">/100</span></div>
                    <span className="px-4 py-1 rounded-full font-bold text-sm bg-white/50 border border-current">
                        {data?.risk?.level} Risk
                    </span>
                </motion.div>

                {/* Satellite Insights */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-4 bg-green-100 rounded-full text-green-600">
                            <Satellite className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Vegetation Index (NDVI)</p>
                            <p className="text-2xl font-black text-gray-900">{data?.satellite?.ndvi}</p>
                            <p className="text-sm font-medium text-green-600">{data?.satellite?.vegetationHealth}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                            <Droplets className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Soil Moisture</p>
                            <p className="text-2xl font-black text-gray-900">{data?.satellite?.soilMoisture}%</p>
                            <p className="text-sm text-gray-500">Volumetric Water Content</p>
                        </div>
                    </div>

                    {/* Alert Feed */}
                    <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" /> Live Alerts & Recommendations
                            </h3>
                            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-md">
                                {data?.alerts?.length || 0} Active
                            </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {data?.alerts?.map((alert, idx) => (
                                <div key={idx} className="p-4 flex items-start space-x-3 hover:bg-gray-50 transition">
                                    {alert.type === 'critical' && <AlertTriangle className="w-5 h-5 text-red-500 mt-1" />}
                                    {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 mt-1" />}
                                    {alert.type === 'info' && <Info className="w-5 h-5 text-blue-500 mt-1" />}
                                    {alert.type === 'success' && <ShieldCheck className="w-5 h-5 text-green-500 mt-1" />}

                                    <div>
                                        <h4 className={`font-bold text-sm ${alert.type === 'critical' ? 'text-red-700' :
                                                alert.type === 'warning' ? 'text-amber-700' : 'text-gray-900'
                                            }`}>
                                            {alert.title}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Weather Forecast */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Sun className="w-64 h-64" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between mb-10">
                    <div>
                        <div className="flex items-center space-x-2 text-blue-200 font-bold mb-2">
                            <MapPin className="w-4 h-4" /> <span>Local Field Forecast</span>
                        </div>
                        <h2 className="text-6xl font-black">{data?.weather?.current?.temp}°C</h2>
                        <p className="text-xl font-medium text-blue-100 mt-1 flex items-center">
                            {getWeatherIcon(data?.weather?.current?.condition || '')}
                            <span className="ml-2">{data?.weather?.current?.condition}</span>
                        </p>
                    </div>
                    <div className="mt-6 md:mt-0 flex space-x-6 text-center">
                        <div>
                            <p className="text-blue-300 text-xs font-bold uppercase">Humidity</p>
                            <p className="text-xl font-bold">{data?.weather?.current?.humidity}%</p>
                        </div>
                        <div>
                            <p className="text-blue-300 text-xs font-bold uppercase">Wind</p>
                            <p className="text-xl font-bold">{data?.weather?.current?.windSpeed} km/h</p>
                        </div>
                        <div>
                            <p className="text-blue-300 text-xs font-bold uppercase">Rain</p>
                            <p className="text-xl font-bold">{data?.weather?.current?.precipitation} mm</p>
                        </div>
                    </div>
                </div>

                {/* 7 Day Forecast */}
                <div className="grid grid-cols-7 gap-2">
                    {data?.weather?.forecast?.map((day, idx) => (
                        <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/5 hover:bg-white/20 transition">
                            <p className="text-xs font-bold text-blue-100 mb-2">{day.day}</p>
                            <div className="flex justify-center mb-2 scale-75">
                                {getWeatherIcon(day.condition)}
                            </div>
                            <p className="font-bold">{day.temp}°</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SmartAlerts;
