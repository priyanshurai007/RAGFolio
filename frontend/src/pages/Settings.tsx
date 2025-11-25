import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">User ID</label>
            <input
              type="text"
              value={user?.userId || ''}
              disabled
              className="input bg-gray-100"
            />
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-bold mb-4">About RAGfolio</h2>
        
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            RAGfolio is an AI-powered resume portfolio system that uses Retrieval-Augmented
            Generation (RAG) to answer questions about your resume.
          </p>
          
          <div className="border-l-4 border-primary-500 pl-4">
            <p className="font-medium">Key Features:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Upload PDF/DOCX resumes</li>
              <li>Automatic section detection and parsing</li>
              <li>AI-powered Q&A using OpenAI embeddings</li>
              <li>Vector storage with Pinecone or FAISS</li>
              <li>Edit and manage your resume data</li>
            </ul>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Version 1.0.0 • Built with React, TypeScript, Node.js, Python, and OpenAI
          </p>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-bold mb-4 text-red-600">Danger Zone</h2>
        
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>
    </div>
  );
}
