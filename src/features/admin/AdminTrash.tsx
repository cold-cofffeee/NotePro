import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { toast } from "react-hot-toast";
import { fetchDeletedNotes, restoreNoteAdmin, deleteNotePermanently } from "./adminApi";
import { Trash2 } from "lucide-react";

export function AdminTrash() {
  const [deletedNotes, setDeletedNotes] = useState<any[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadDeletedNotes = async () => {
    try {
      setLoading(true);
      const data = await fetchDeletedNotes();
      setDeletedNotes(data);
    } catch (error) {
      toast.error("Failed to load deleted notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeletedNotes();
  }, []);

  useEffect(() => {
    let result = deletedNotes;
    if (searchTerm) {
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.user_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredNotes(result);
  }, [deletedNotes, searchTerm]);

  const handleRestore = async (noteId: string) => {
    try {
      await restoreNoteAdmin(noteId);
      toast.success("Note restored");
      loadDeletedNotes();
    } catch (error) {
      toast.error("Failed to restore note");
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Permanently delete this note? This cannot be undone.")) return;
    try {
      await deleteNotePermanently(noteId);
      toast.success("Note permanently deleted");
      loadDeletedNotes();
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Trash Oversight</h1>
        <div className="text-sm text-muted-foreground">
          {filteredNotes.length} deleted notes
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Search Notes
        </label>
        <Input
          placeholder="Search by title or user email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading deleted notes...
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-8 text-center">
              <Trash2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No deleted notes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Owner (Email)</th>
                    <th className="px-6 py-4">Deleted At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium max-w-xs truncate">
                        {note.title}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {note.user_email}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(note.deleted_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(note.id)}
                        >
                          Restore
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(note.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
