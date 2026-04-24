import { useState, useEffect } from "react";
import { fetchAllNotes } from "./adminApi";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "react-hot-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";

export function AdminNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 25;

  const loadNotes = async (pageNum: number) => {
    try {
      setLoading(true);
      const data = await fetchAllNotes(pageNum, pageSize);
      setNotes(data.data);
      setTotal(data.pagination.total);
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes(page);
  }, [page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Notes Oversight</h1>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading notes...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Owner (Email)</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created At</th>
                      <th className="px-6 py-4">Updated At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {notes.map((note) => (
                      <tr key={note.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 font-medium max-w-[200px] truncate">
                          {note.title}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{note.user_email}</td>
                        <td className="px-6 py-4">
                          {note.is_archived ? (
                            <span className="text-yellow-500 text-xs bg-yellow-500/10 px-2 py-1 rounded-full">
                              Archived
                            </span>
                          ) : (
                            <span className="text-green-500 text-xs bg-green-500/10 px-2 py-1 rounded-full">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {new Date(note.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {new Date(note.updated_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({total} total)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
