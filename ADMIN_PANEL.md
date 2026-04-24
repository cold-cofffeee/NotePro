# NotePro Admin Panel

A production-grade, secure admin system for managing users, notes, analytics, and audit logs.

## Architecture Overview

The admin module is fully isolated and modular:

```
/src/features/admin/
├── AdminLayout.tsx           # Main admin container with sidebar navigation
├── AdminDashboard.tsx        # Overview dashboard with metrics & real-time feed
├── AdminAnalytics.tsx        # Charts & growth metrics (7d/30d views)
├── AdminUsers.tsx            # User management, suspension, deletion
├── AdminNotes.tsx            # Overview of all user notes
├── AdminTrash.tsx            # Deleted notes management
├── AdminTags.tsx             # Tag lifecycle management
├── AdminAuditLogs.tsx        # Comprehensive audit trail with filters
└── adminApi.ts               # Centralized API client

/server/
├── admin.ts                  # All admin API endpoints
├── audit.ts                  # Audit logging system
├── realtime.ts               # Server-Sent Events for live updates
├── middleware.ts             # Authentication & RBAC enforcement
└── db.ts                     # Database schema with indices
```

## Features Implemented

### 1. Dashboard
- **Real-time Metrics**
  - Total users count
  - Active notes (non-deleted)
  - Active users (last 7 days)
  - Deleted notes count
- **Live Admin Count**: Shows how many admins are currently viewing the panel
- **Activity Feed**: Real-time stream of recent audit events

### 2. Analytics Dashboard
- **User Growth Chart**: Line chart showing new user registrations over time
- **Notes Creation Chart**: Bar chart showing notes created per day
- **Tag Frequency Chart**: Top 10 most-used tags across the system
- **Time Range Filters**: Toggle between 7-day and 30-day views
- **Responsive Design**: Adapts to light/dark mode and screen sizes

### 3. Real-Time Updates
- **Server-Sent Events (SSE)**: Bi-directional event streaming
- **Active Connections**: Dashboard shows how many admins are online
- **Live Event Feed**: Automatically updates as events occur
- **No Polling**: Efficient server push model

### 4. User Management
- **User List**: Paginated table (25 per page) with search
- **Columns**: Email, Role, Notes Count, Status, Created Date
- **Actions**:
  - Suspend/Activate users (prevents login)
  - Delete users (soft-delete via suspension)
  - View user details
- **RBAC Protection**: Cannot suspend/delete other admins

### 5. Notes Oversight
- **Global Note Visibility**: See all notes across all users
- **Columns**: Title, Owner Email, Status, Created/Updated timestamps
- **Pagination**: 25 notes per page
- **Status Badges**: Active, Archived indicators
- **Performance**: Optimized queries with indices

### 6. Trash Management
- **Deleted Notes Oversight**: Admin can see all soft-deleted notes
- **Actions**:
  - Restore notes to active state
  - Permanently delete (hard delete)
  - Search by title or user email
- **Independent of User Logic**: Admins can restore notes even after user's 7-day auto-delete

### 7. Tag Management
- **Global Tag Visibility**: View all tags across the system
- **Metrics**: Show usage count per tag
- **Actions**:
  - Rename tags inline
  - Delete unused or spam tags
  - Color assignment
- **Search**: Filter tags by name

### 8. Audit Logs
- **Comprehensive Trail**: Every important action is logged
- **Logged Actions**:
  - User registration, login
  - Note create, update, delete, restore, trash
  - User suspend, activate, delete
  - Tag operations
  - Admin actions
- **Filters**:
  - By action type (dropdown)
  - By user/actor (search)
- **Columns**: Action, User, Target ID, Timestamp, Metadata
- **Pagination**: 25 logs per page
- **Metadata**: JSON details (e.g., note title, email)

## Security & Access Control

### Authentication
- All admin endpoints require valid JWT token
- Token can be passed via:
  - `Authorization: Bearer <token>` header
  - `?token=<token>` query parameter (for SSE)

### Role-Based Access Control (RBAC)
```typescript
// Enforce admin role on EVERY admin endpoint
adminRouter.use(authenticate, requireAdmin);
```

**Three role levels**:
1. **user**: Cannot access `/admin/*`
2. **admin**: Full access to admin panel
3. **superadmin**: (Future) Unrestricted access

**First registered user automatically becomes admin** to bootstrap the system.

### Security Features
- Suspended users cannot login or use the app
- Admin actions are logged immediately
- No data leakage: Users can only see their own notes
- Permissions validated on every request (not just on initial load)

## API Endpoints

### Dashboard
- `GET /api/admin/dashboard` - Metrics (users, notes, active users, deleted notes)

### Analytics
- `GET /api/admin/analytics?range=7d|30d` - Growth data with time range

### Users
- `GET /api/admin/users?page=1&limit=50` - Paginated user list
- `POST /api/admin/users/:id/suspend` - Suspend/activate user
- `DELETE /api/admin/users/:id` - Delete (soft-delete) user

### Notes
- `GET /api/admin/notes?page=1&limit=50` - All active notes
- `GET /api/admin/notes/deleted?page=1&limit=50` - All deleted notes
- `POST /api/admin/notes/:id/restore` - Restore from trash
- `DELETE /api/admin/notes/:id` - Permanently delete

### Tags
- `GET /api/admin/tags` - All tags with usage counts
- `PATCH /api/admin/tags/:id` - Rename tag
- `DELETE /api/admin/tags/:id` - Delete tag

### Audit Logs
- `GET /api/admin/audit?page=1&limit=100` - Paginated audit trail

### Real-Time (SSE)
- `GET /api/admin/realtime/stream` - Server-Sent Events stream

## Database Schema

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL,      -- e.g., "note_created", "user_suspended"
  actor_id TEXT,                  -- User who performed the action
  target_id TEXT,                 -- Note/user/tag affected
  metadata TEXT,                  -- JSON with additional details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Extended Users Table
```sql
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE users ADD COLUMN is_suspended BOOLEAN DEFAULT 0;
```

### Performance Indices
```sql
CREATE INDEX idx_audit_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_users_created ON users(created_at DESC);
CREATE INDEX idx_notes_deleted ON notes(deleted_at);
```

## Frontend Usage

### Import Admin Components
```typescript
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminAnalytics } from './features/admin/AdminAnalytics';
import { AdminUsers } from './features/admin/AdminUsers';
// ... etc
```

### Protect Admin Routes
```typescript
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  // Only allow if user is admin
  return <AdminLayout>{children}</AdminLayout>;
};

<Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
```

## Real-Time Implementation

### Server (Node.js/Express)
```typescript
// broadcast realtime events to all connected admins
broadcastEvent("note_created", {
  noteId,
  userId,
  title,
  timestamp: new Date().toISOString()
});
```

### Client (React)
```typescript
useEffect(() => {
  const token = localStorage.getItem("auth_token");
  const eventSource = new EventSource(`/api/admin/realtime/stream?token=${token}`);
  
  eventSource.onmessage = (event) => {
    const { type, data } = JSON.parse(event.data);
    // Update UI with real-time data
  };
  
  return () => eventSource.close();
}, []);
```

## Performance Optimizations

### Pagination
- All list endpoints support `page` and `limit` parameters
- Default 25-50 items per page
- Prevents loading thousands of records at once

### Database Indices
- Audit logs indexed by action_type, created_at, actor_id
- Users indexed by created_at (for analytics)
- Notes indexed by deleted_at (for trash)

### Aggregation Queries
- Analytics use `GROUP BY` and date truncation
- Tag frequency aggregated at query time
- No N+1 queries

### Real-Time Optimization
- SSE events sent only when changes occur
- No heartbeat overhead
- Graceful disconnect handling

## Future Enhancements

1. **Advanced Analytics**
   - User retention curves
   - Daily active users (DAU)
   - Custom date ranges

2. **Bulk Operations**
   - Bulk user suspend/delete
   - Bulk note restore/delete

3. **Export/Reporting**
   - CSV export of audit logs
   - Monthly activity reports

4. **Admin Settings**
   - Customize dashboard widgets
   - Email notifications on critical events

5. **Multi-Admin**
   - Admin creation (don't hardcode first user)
   - Permission levels (view-only, edit, delete)

## Testing Checklist

- [ ] Navigate to `/admin` as non-admin → redirects to `/notes`
- [ ] Navigate to `/admin` as admin → loads dashboard
- [ ] Dashboard metrics update in real-time
- [ ] Suspend user → user cannot login
- [ ] Delete note → appears in trash → admin can restore
- [ ] Create note → appears in audit logs within 1 second
- [ ] Audit logs filter by action and user
- [ ] Analytics show correct data for 7d/30d ranges
- [ ] Charts render correctly in light/dark mode
- [ ] Pagination works on all list views
- [ ] Real-time feed updates smoothly (no flicker)
