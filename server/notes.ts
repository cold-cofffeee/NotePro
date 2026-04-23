import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "./db.js";
import { authenticate, AuthRequest } from "./middleware.js";

export const notesRouter = Router();

notesRouter.use(authenticate);

notesRouter.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const result = await db.execute({
      sql: `SELECT n.*, group_concat(t.name) as tags 
            FROM notes n 
            LEFT JOIN note_tags nt ON n.id = nt.note_id 
            LEFT JOIN tags t ON nt.tag_id = t.id 
            WHERE n.user_id = ? AND n.is_archived = 0 
            GROUP BY n.id 
            ORDER BY n.updated_at DESC`,
      args: [userId as string]
    });

    const notes = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      isArchived: Boolean(row.is_archived),
      tags: row.tags ? String(row.tags).split(",") : [],
      createdAt: new Date(row.created_at as string).getTime(),
      updatedAt: new Date(row.updated_at as string).getTime(),
    }));

    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

notesRouter.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const noteId = req.params.id;

    const result = await db.execute({
      sql: `SELECT n.*, group_concat(t.name) as tags 
            FROM notes n 
            LEFT JOIN note_tags nt ON n.id = nt.note_id 
            LEFT JOIN tags t ON nt.tag_id = t.id 
            WHERE n.user_id = ? AND n.id = ?
            GROUP BY n.id`,
      args: [userId as string, noteId]
    });

    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ error: "Note not found" });
    }

    const note = {
      id: row.id,
      title: row.title,
      content: row.content,
      isArchived: Boolean(row.is_archived),
      tags: row.tags ? String(row.tags).split(",") : [],
      createdAt: new Date(row.created_at as string).getTime(),
      updatedAt: new Date(row.updated_at as string).getTime(),
    };

    res.json(note);
  } catch (error) {
    console.error("Get single note error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

notesRouter.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { title, content, tags } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const noteId = uuidv4();
    await db.execute({
      sql: "INSERT INTO notes (id, user_id, title, content) VALUES (?, ?, ?, ?)",
      args: [noteId, userId as string, title, content || ""]
    });

    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        let tagResult = await db.execute({
          sql: "SELECT id FROM tags WHERE user_id = ? AND name = ?",
          args: [userId as string, tagName]
        });
        
        let tagId = tagResult.rows[0]?.id;
        if (!tagId) {
          tagId = uuidv4();
          await db.execute({
            sql: "INSERT INTO tags (id, user_id, name) VALUES (?, ?, ?)",
            args: [tagId, userId as string, tagName]
          });
        }
        
        await db.execute({
          sql: "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
          args: [noteId, tagId as string]
        });
      }
    }

    res.status(201).json({ id: noteId, title, content, tags: tags || [] });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

notesRouter.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const noteId = req.params.id;
    const { title, content, isArchived, tags } = req.body;

    await db.execute({
      sql: "UPDATE notes SET title = ?, content = ?, is_archived = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
      args: [title, content, isArchived ? 1 : 0, noteId, userId as string]
    });
    
    await db.execute({
      sql: "DELETE FROM note_tags WHERE note_id = ?",
      args: [noteId]
    });

    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        let tagResult = await db.execute({
          sql: "SELECT id FROM tags WHERE user_id = ? AND name = ?",
          args: [userId as string, tagName]
        });
        
        let tagId = tagResult.rows[0]?.id;
        if (!tagId) {
          tagId = uuidv4();
          await db.execute({
            sql: "INSERT INTO tags (id, user_id, name) VALUES (?, ?, ?)",
            args: [tagId, userId as string, tagName]
          });
        }
        
        await db.execute({
          sql: "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
          args: [noteId, tagId as string]
        });
      }
    }

    res.json({ message: "Note updated successfully" });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

notesRouter.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const noteId = req.params.id;

    await db.execute({
      sql: "DELETE FROM notes WHERE id = ? AND user_id = ?",
      args: [noteId, userId as string]
    });

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
