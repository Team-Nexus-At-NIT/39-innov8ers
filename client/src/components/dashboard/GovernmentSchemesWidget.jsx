import React from 'react';
import { ShieldCheck, Landmark, TrendingUp, Cpu, ExternalLink, ArrowRight } from 'lucide-react';

const SCHEMES = [
    {
        id: 'pm-kisan',
        title: 'PM-KISAN Samman Nidhi',
        desc: 'Direct income support of ₹6,000 p.a. provided to small and marginal farmers.',
        link: 'https://pmkisan.gov.in/',
        type: 'Income Support',
        icon: Landmark,
        color: 'emerald'
    },
    {
        id: 'pmfby',
        title: 'Pradhan Mantri Fasal Bima Yojana',
        desc: 'Financial support and risk cover to farmers in the event of crop failure.',
        link: 'https://pmfby.gov.in/',
        type: 'Insurance',
        icon: ShieldCheck,
        color: 'blue'
    },
    {
        id: 'enam',
        title: 'eNAM Market Portal',
        desc: 'National online trading platform for agricultural commodities across India.',
        link: 'https://enam.gov.in/',
        type: 'Marketplace',
        icon: TrendingUp,
        color: 'amber'
    },
    {
        id: 'soil-health',
        title: 'Soil Health Card Scheme',
        desc: 'Soil testing and advisory services to optimize fertilizer usage per crop.',
        link: 'https://soilhealth.dac.gov.in/',
        type: 'Optimization',
        icon: Cpu,
        color: 'green'
    }
];

const GovernmentSchemesWidget = () => {
    return (
        <div className="flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden group/schemes">
            {/* Header */}
            <div className="relative h-28 flex flex-col justify-between overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-indigo-900 shadow-inner" />
                {/* Subtle Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20L0 20z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E\")" }} />

                <div className="relative z-10 p-5 flex justify-between items-center h-full">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-white/10 rounded-xl border border-white/20 backdrop-blur-md">
                            <ShieldCheck className="w-5 h-5 text-blue-300" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-white tracking-tight uppercase">Govt Schemes</h3>
                            <p className="text-[10px] font-bold text-blue-200/80 uppercase tracking-[0.2em] mt-0.5">National Portals</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30 backdrop-blur-sm">
                        <span className="text-[8px] font-black text-blue-100 uppercase tracking-widest">Official</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="p-4 bg-gray-50/30 space-y-3">
                {SCHEMES.map((scheme) => (
                    <a
                        key={scheme.id}
                        href={scheme.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 group/item relative overflow-hidden"
                    >
                        {/* Hover Accent */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 opacity-0 group-hover/item:opacity-100 transition-opacity" />

                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl bg-${scheme.color}-50 border border-${scheme.color}-100 group-hover/item:bg-${scheme.color}-600 transition-colors`}>
                                <scheme.icon className={`w-4 h-4 text-${scheme.color}-600 group-hover/item:text-white`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{scheme.type}</span>
                                    <ExternalLink className="w-3 h-3 text-gray-300 group-hover/item:text-blue-500 transition-colors" />
                                </div>
                                <h4 className="text-xs font-black text-gray-900 group-hover/item:text-blue-900 transition-colors uppercase tracking-tight">
                                    {scheme.title}
                                </h4>
                                <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 font-medium leading-relaxed group-hover/item:text-gray-600">
                                    {scheme.desc}
                                </p>
                            </div>
                        </div>
                    </a>
                ))}
                
                <button 
                    onClick={() => window.open('https://www.india.gov.in/my-government/schemes', '_blank')}
                    className="w-full mt-2 py-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                >
                    Explore More Services <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};

export default GovernmentSchemesWidget;
