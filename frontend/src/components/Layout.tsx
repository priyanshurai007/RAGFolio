import { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { LogOut, Upload, Settings, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4 md:space-x-8">
              <Link to="/" className="text-xl md:text-2xl font-bold text-primary-600">
                RAGfolio
              </Link>
              
              <div className="hidden md:flex space-x-4">
                <Link
                  to="/upload"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <Upload size={20} />
                  <span>Upload</span>
                </Link>
                
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <span className="hidden sm:inline text-sm text-gray-600 truncate max-w-[150px] md:max-w-none">
                {user?.email}
              </span>
              
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t py-4 space-y-2">
              <Link
                to="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <Upload size={20} />
                <span>Upload</span>
              </Link>
              
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                <Settings size={20} />
                <span>Settings</span>
              </Link>
              
              <div className="sm:hidden px-3 py-2 text-sm text-gray-600">
                {user?.email}
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 text-red-600"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>
      
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <Outlet />
        </div>
      </main>
      
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-xs sm:text-sm text-gray-600">
            © 2025 RAGfolio. Built with React, TypeScript, and AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
