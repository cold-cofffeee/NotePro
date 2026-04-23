import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, Edit2, Tag as TagIcon, Calendar, Clock, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from './ui/badge';
import api from '../lib/api';

export function NoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/notes/${id}`);
      setNote(response.data);
    } catch (error) {
      toast.error('Failed to load note');
      navigate('/notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Note deleted');
      navigate('/notes');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">Loading...</div>;
  }

  if (!note) {
    return <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">Note not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[80vh] flex flex-col">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-gray-50/50">
          <Button variant="ghost" onClick={() => navigate('/notes')} className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Notes
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button onClick={() => navigate(`/note/${id}/edit`)} className="bg-black text-white hover:bg-gray-800">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Note
            </Button>
          </div>
        </div>

        <div className="p-8 flex-grow flex flex-col">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{note.title}</h1>
          
          <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100 flex-wrap">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Created {new Date(note.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Updated {new Date(note.updatedAt).toLocaleDateString()}
            </div>
            
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div 
            className="prose prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-gray-50"
            dangerouslySetInnerHTML={{ __html: note.content || '<p class="text-gray-400 italic">Empty note</p>' }}
          />
        </div>
      </div>
    </div>
  );
}
