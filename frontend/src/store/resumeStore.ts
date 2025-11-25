import { create } from 'zustand';

interface Resume {
  id: string;
  filename: string;
  parsedData: any;
  createdAt?: string;
}

interface ResumeState {
  resumes: Resume[];
  currentResume: Resume | null;
  setResumes: (resumes: Resume[]) => void;
  setCurrentResume: (resume: Resume | null) => void;
  addResume: (resume: Resume) => void;
  updateResume: (id: string, data: Partial<Resume>) => void;
  deleteResume: (id: string) => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  resumes: [],
  currentResume: null,
  
  setResumes: (resumes) => set({ resumes }),
  
  setCurrentResume: (resume) => set({ currentResume: resume }),
  
  addResume: (resume) =>
    set((state) => ({ resumes: [resume, ...state.resumes] })),
  
  updateResume: (id, data) =>
    set((state) => ({
      resumes: state.resumes.map((r) => (r.id === id ? { ...r, ...data } : r)),
      currentResume:
        state.currentResume?.id === id
          ? { ...state.currentResume, ...data }
          : state.currentResume,
    })),
  
  deleteResume: (id) =>
    set((state) => ({
      resumes: state.resumes.filter((r) => r.id !== id),
      currentResume: state.currentResume?.id === id ? null : state.currentResume,
    })),
}));
