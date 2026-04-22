import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Schemes from './pages/Schemes';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile'; // New Import
import AdminData from './pages/AdminData';
import TrackContract from './pages/dashboard/TrackContract';
import MarketPrices from './pages/MarketPrices';
import Chatbot from './components/Chatbot';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/market" element={<MarketPrices />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<PublicProfile />} /> {/* New Route */}
          <Route path="/admin/data" element={<AdminData />} />
          <Route path="/contract/:id/track" element={<TrackContract />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
        <Chatbot />
      </Router>
    </AuthProvider>
  );
}

export default App;
