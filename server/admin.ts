import { Router } from "express";
import { db } from "./db.js";
import { authenticate, requireAdmin, AuthRequest } from "./middleware.js";
import { logAudit } from "./audit.js";
import { realtimeRouter } from "./realtime.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin as any);
adminRouter.use("/realtime", realtimeRouter);

adminRouter.get("/dashboard", async (req, res) => {
  try {
    const totalUsers = await db.execute("SELECT COUNT(*) as count FROM users");
    const totalNotes = await db.execute("SELECT COUNT(*) as count FROM notes");
    const activeUsers = await db.execute("SELECT COUNT(DISTINCT user_id) as count FROM notes WHERE updated_at > datetime('now', '-7 days')");
    const deletedNotes = await db.execute("SELECT COUNT(*) as count FROM notes WHERE deleted_at IS NOT NULL");
    
    res.json({
      totalUsers: totalUsers.rows[0].count,
      totalNotes: totalNotes.rows[0].count,
      activeUsers: activeUsers.rows[0].count,
      deletedNotes: deletedNotes.rows[0].count,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard metrics" });
  }
});

adminRouter.get("/analytics", async (req, res) => {
  try {
    const userGrowth = await db.execute(`
      SELECT date(created_at) as date, COUNT(*) as count 
      FROM users 
      WHERE created_at > datetime('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY date(created_at)
    `);

    const notesGrowth = await db.execute(`
      SELECT date(created_at) as date, COUNT(*) as count 
      FROM notes 
      WHERE created_at > datetime('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY date(created_at)
    `);

    res.json({
      userGrowth: userGrowth.rows,
      notesGrowth: notesGrowth.rows,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

adminRouter.get("/users", async (req, res) => {
  try {
    const users = await db.execute(`
      SELECT u.id, u.email, u.role, u.is_suspended, u.created_at, COUNT(n.id) as note_count
      FROM users u
      LEFT JOIN notes n ON u.id = n.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(users.rows.map(r => ({
      ...r,
      is_suspended: !!r.is_suspended
    })));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

adminRouter.post("/users/:id/suspend", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isSuspended } = req.body;
    await db.execute({
      sql: "UPDATE users SET is_suspended = ? WHERE id = ?",
      args: [isSuspended ? 1 : 0, id]
    });
    
    await logAudit(
      isSuspended ? "suspend_user" : "activate_user",
      req.userId as string,
      id
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

adminRouter.get("/notes", async (req, res) => {
  try {
    const notes = await db.execute(`
      SELECT n.id, n.title, n.created_at, n.updated_at, n.deleted_at, n.is_archived, u.email as user_email
      FROM notes n
      JOIN users u ON n.user_id = u.id
      ORDER BY n.updated_at DESC
      LIMIT 100
    `);
    res.json(notes.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

adminRouter.get("/audit", async (req, res) => {
  try {
    const logs = await db.execute(`
      SELECT a.*, u.email as actor_email
      FROM audit_logs a
      LEFT JOIN users u ON a.actor_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);
    res.json(logs.rows.map(row => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata as string) : {}
    })));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});
