const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'Navbar.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix z-index overlap
content = content.replace('shadow-md z-50 relative', 'shadow-md z-[100] relative');

// 2. Change Mobile Sidebar colors
content = content.replace('bg-white/80 backdrop-blur-xl border-l border-white/40', 'bg-blue-900/95 backdrop-blur-xl border-l border-blue-800');
content = content.replace('border-b border-gray-200/50 bg-white/40', 'border-b border-blue-800 bg-blue-950/50');
content = content.replace(/text-gray-800/g, 'text-gray-200');
content = content.replace('text-gray-800">Menu', 'text-white">Menu'); // Fix the H2 header
content = content.replace('text-gray-600 hover:bg-black/5 hover:text-black', 'text-gray-300 hover:bg-white/10 hover:text-white');
content = content.replace(/hover:bg-blue-50\/80 hover:text-blue-700/g, 'hover:bg-white/10 hover:text-yellow-400');
content = content.replace('border-l-2 border-gray-200/60', 'border-l-2 border-blue-800');
content = content.replace('border-t border-gray-200/50 bg-white/50', 'border-t border-blue-800 bg-blue-950/80');

// Fix text-gray-200">Menu to text-white">Menu from global regex replacing text-gray-800 earlier
content = content.replace('text-gray-200">Menu', 'text-white">Menu');

// Fix login and register footer UI
content = content.replace('bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40', 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold rounded-xl shadow-lg hover:shadow-xl');
content = content.replace('bg-white text-blue-700 border-2 border-blue-100 font-bold rounded-xl shadow-sm hover:border-blue-300 hover:bg-blue-50', 'bg-transparent text-white border-2 border-white/30 font-bold rounded-xl shadow-sm hover:border-white hover:bg-white/10');
content = content.replace('bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40', 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold rounded-xl shadow-lg hover:shadow-xl');

// Overlay color
content = content.replace('bg-black/40 backdrop-blur-sm z-40', 'bg-black/60 backdrop-blur-sm z-40');


fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Navbar.jsx');
