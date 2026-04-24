import { useState, useEffect } from "react";
import { fetchAllNotes } from "./adminApi";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "react-hot-toast";

export function AdminNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = async () => {
    try {
      const data = await fetchAllNotes();
      setNotes(data);
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Notes Oversight</h1>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading notes...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Owner (Email)</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {notes.map((note) => (
                    <tr key={note.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium max-w-[200px] truncate">{note.title}</td>
                      <td className="px-6 py-4 text-muted-foreground">{note.user_email}</td>
                      <td className="px-6 py-4">
                        {note.deleted_at ? (
                          <span className="text-red-500 text-xs bg-red-500/10 px-2 py-1 rounded-full">Trash</span>
                        ) : note.is_archived ? (
                          <span className="text-yellow-500 text-xs bg-yellow-500/10 px-2 py-1 rounded-full">Archived</span>
                        ) : (
                          <span className="text-green-500 text-xs bg-green-500/10 px-2 py-1 rounded-full">Active</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString()}
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
