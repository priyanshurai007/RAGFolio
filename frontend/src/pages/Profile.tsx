import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, Edit2, Save, Trash2, MessageSquare, Shield, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeAPI } from '../lib/api';
import AuthenticityReport from '../components/AuthenticityReport';
import ProfileAnalysis from '../components/ProfileAnalysis';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [showAuthenticity, setShowAuthenticity] = useState(false);
  const [showProfileAnalysis, setShowProfileAnalysis] = useState(false);

  useEffect(() => {
    loadResume();
  }, [id]);

  const loadResume = async () => {
    try {
      const response = await resumeAPI.getById(id!);
      setResume(response.data.resume);
      setEditedData(response.data.resume.parsedData);
    } catch (error) {
      toast.error('Failed to load resume');
      navigate('/upload');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await resumeAPI.update(id!, editedData);
      setResume({ ...resume, parsedData: editedData });
      setEditing(false);
      toast.success('Resume updated successfully');
    } catch (error) {
      toast.error('Failed to update resume');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      await resumeAPI.delete(id!);
      toast.success('Resume deleted successfully');
      navigate('/upload');
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const updateSection = (section: string, value: string) => {
    setEditedData({
      ...editedData,
      sections: {
        ...editedData.sections,
        [section]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{resume.filename}</h1>
        
        <div className="flex space-x-3">
          {resume.parsedData?.profile_analysis && (
            <button
              onClick={() => {
                setShowProfileAnalysis(!showProfileAnalysis);
                setShowAuthenticity(false);
              }}
              className={`btn flex items-center space-x-2 ${
                showProfileAnalysis ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <LinkIcon size={18} />
              <span>Profile Analysis</span>
            </button>
          )}
          
          {resume.parsedData?.authenticityReport && (
            <button
              onClick={() => {
                setShowAuthenticity(!showAuthenticity);
                setShowProfileAnalysis(false);
              }}
              className={`btn flex items-center space-x-2 ${
                showAuthenticity ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              <Shield size={18} />
              <span>Authenticity</span>
            </button>
          )}
          
          <button
            onClick={() => navigate(`/chat/${id}`)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <MessageSquare size={18} />
            <span>Ask Questions</span>
          </button>
          
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <Edit2 size={18} />
              <span>Edit</span>
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Save size={18} />
              <span>Save</span>
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="btn btn-danger flex items-center space-x-2"
          >
            <Trash2 size={18} />
            <span>Delete</span>
          </button>
        </div>
      </div>
      
      {/* Profile Analysis Section */}
      {showProfileAnalysis && resume.parsedData?.profile_analysis && (
        <div className="mb-6">
          <ProfileAnalysis analysis={resume.parsedData.profile_analysis} />
        </div>
      )}
      
      {/* Authenticity Report Section */}
      {showAuthenticity && resume.parsedData?.authenticityReport && (
        <AuthenticityReport report={resume.parsedData.authenticityReport} />
      )}
      
      <div className="space-y-4">
        {editedData?.sections &&
          Object.entries(editedData.sections).map(([section, content]: [string, any]) => (
            <div key={section} className="card">
              <h2 className="text-xl font-bold mb-3">{section}</h2>
              
              {editing ? (
                <textarea
                  value={content}
                  onChange={(e) => updateSection(section, e.target.value)}
                  className="input min-h-[150px]"
                />
              ) : (
                <div className="whitespace-pre-wrap text-gray-700">{content}</div>
              )}
            </div>
          ))}
      </div>
      
      {editedData?.metadata && (
        <div className="card">
          <h2 className="text-xl font-bold mb-3">Metadata</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Word Count</p>
              <p className="font-medium">{editedData.metadata.word_count}</p>
            </div>
            {editedData.metadata.total_pages && (
              <div>
                <p className="text-sm text-gray-600">Total Pages</p>
                <p className="font-medium">{editedData.metadata.total_pages}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
