import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, File, Loader, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeAPI } from '../lib/api';
import { useResumeStore } from '../store/resumeStore';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const addResume = useResumeStore((state) => state.addResume);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const response = await resumeAPI.getAll();
      setResumes(response.data.resumes);
    } catch (error) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, resumeId: string, filename: string) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      await resumeAPI.delete(resumeId);
      setResumes(resumes.filter(r => r.id !== resumeId));
      toast.success('Resume deleted successfully');
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const response = await resumeAPI.upload(file, setProgress);
      const resume = response.data.resume;
      
      addResume(resume);
      toast.success('Resume uploaded successfully!');
      setFile(null);
      navigate(`/chat/${resume.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-8">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Upload Your Resume</h1>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={uploading}
          />
          
          <label htmlFor="file-upload" className="cursor-pointer">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF or DOCX (max 10MB)</p>
          </label>
          
          {file && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <File className="h-5 w-5 text-primary-600" />
              <span className="text-sm">{file.name}</span>
            </div>
          )}
        </div>
        
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-center mt-2">{progress}% uploaded</p>
          </div>
        )}
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn btn-primary w-full mt-4"
        >
          {uploading ? 'Uploading...' : 'Upload Resume'}
        </button>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Your Resumes</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader className="animate-spin h-8 w-8 text-primary-600" />
          </div>
        ) : resumes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No resumes uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="border rounded-lg p-4 hover:border-primary-500 cursor-pointer transition-colors"
                onClick={() => navigate(`/chat/${resume.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{resume.filename}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/chat/${resume.id}`);
                      }}
                      className="btn btn-primary text-sm"
                    >
                      Ask Questions
                    </button>
                    
                    <button
                      onClick={(e) => handleDelete(e, resume.id, resume.filename)}
                      className="btn btn-danger text-sm flex items-center space-x-1"
                      title="Delete resume"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
