import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ClientFlow from './pages/client/ClientFlow';
import ReceptionDashboard from './pages/reception/ReceptionDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import { Scissors } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-brand-light flex flex-col font-sans">
        {/* Global Navigation - Only for the MVP easy testing */}
        <nav className="bg-brand-dark text-brand-beige p-4 shadow-md sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-serif text-brand-gold">
              <Scissors size={24} />
              <span>PeluquerIA</span>
            </Link>
            <div className="flex gap-4">
              <Link to="/cliente" className="hover:text-brand-gold transition-colors">Cliente</Link>
              <Link to="/recepcion" className="hover:text-brand-gold transition-colors">Recepción</Link>
              <Link to="/admin" className="hover:text-brand-gold transition-colors">Admin</Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 container mx-auto p-4 sm:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cliente/*" element={<ClientFlow />} />
            <Route path="/recepcion/*" element={<ReceptionDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
