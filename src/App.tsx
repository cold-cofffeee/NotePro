import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Tag } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { AuthPage } from './components/AuthPage';
import { TopNav } from './components/TopNav';
import { CommandMenu } from './components/CommandMenu';
import { NotesList } from './components/NotesList';
import { NoteEditor } from './components/NoteEditor';
import { NoteView } from './components/NoteView';
import api from './lib/api';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('auth_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function NotesDashboard() {
  const [notes, setNotes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/notes');
      setNotes(response.data);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav onMenuClick={() => setIsCommandMenuOpen(true)} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="flex-grow flex overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
              <Link to="/note/new" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors inline-block text-sm font-medium shadow-sm">
                New Note
              </Link>
            </div>
            
            {isLoading ? (
              <div className="text-center py-20 text-gray-500">Loading notes...</div>
            ) : filteredNotes.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Tag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No notes found</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">Create a note to start organizing your thoughts, or adjust your search.</p>
                <Link to="/note/new" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors inline-block text-sm font-medium shadow-sm">
                  Create Note
                </Link>
              </div>
            ) : (
              <NotesList notes={filteredNotes} />
            )}
          </div>
        </main>
      </div>
      <CommandMenu isOpen={isCommandMenuOpen} setIsOpen={setIsCommandMenuOpen} notes={notes} tags={[]} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/" element={<><LandingPage /><Footer /></>} />
        <Route path="/auth" element={<AuthPage />} />
        
        <Route 
          path="/notes" 
          element={
            <ProtectedRoute>
              <NotesDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/note/new" 
          element={
            <ProtectedRoute>
              <NoteEditor />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/note/:id/edit" 
          element={
            <ProtectedRoute>
              <NoteEditor />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/note/:id" 
          element={
            <ProtectedRoute>
              <NoteView />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}
