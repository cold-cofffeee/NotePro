# Quick Start: Admin Panel

## Accessing the Admin Panel

### Prerequisites
- You must be the first registered user (automatically becomes admin)
- Or another admin must create you (via future UI)

### Entry Point
```
Navigate to: http://localhost:3001/admin
```

### Routes
| Route | Feature |
|-------|---------|
| `/admin` | Dashboard (metrics + activity feed) |
| `/admin/analytics` | Charts (user growth, notes, tags) |
| `/admin/users` | User management |
| `/admin/notes` | Notes oversight |
| `/admin/trash` | Deleted notes management |
| `/admin/tags` | Tag management |
| `/admin/audit` | Audit logs |

## Dashboard

**What you see:**
- Total users count
- Total notes count
- Active users (last 7 days)
- Deleted notes count
- Real-time activity feed
- Online admin count (pulsing green dot)

**Real-time updates:** Updates automatically as events occur

## Analytics

**Features:**
1. Line chart: User registrations over time
2. Bar chart: Notes created over time
3. Bar chart: Top 10 most-used tags
4. Toggle: Last 7 days vs last 30 days

**Use case:** Track platform growth and engagement

## Users

**View:** All users with pagination (25 per page)

**Columns:**
- Email
- Role (user/admin)
- Number of notes
- Status (Active/Suspended)
- Join date

**Actions:**
- Suspend: Block user from login
- Activate: Re-enable suspended user
- Delete: Soft-delete user account

## Notes

**View:** All active notes (non-deleted) with pagination

**Columns:**
- Title
- Owner email
- Status (Active/Archived)
- Created/updated timestamps

**Use case:** Overview of all content in the system

## Trash

**View:** All soft-deleted notes

**Search:** By note title or user email

**Actions:**
- Restore: Move back to user's active notes
- Delete: Permanently remove (cannot undo)

**Note:** Independent of user's 7-day auto-delete. Admin can restore after 7 days.

## Tags

**View:** All tags with usage counts

**Columns:**
- Tag name
- Color (if assigned)
- Usage count

**Actions:**
- Rename: Click tag to edit inline
- Delete: Remove tag (unlinks from all notes)
- Search: Filter by tag name

## Audit Logs

**View:** Complete action history

**Columns:**
- Action type (badge)
- User/actor
- Target ID (note/user affected)
- Timestamp
- Metadata (JSON)

**Filters:**
1. Action type (dropdown)
2. User/actor (search box)

**Pagination:** 25 logs per page

**Tracked actions:**
- User registration, login
- Note create, update, delete, restore
- User suspend, activate
- Tag operations

## Real-Time Indicator

**Green pulsing dot** in top-right of sidebar shows:
- "N Admin(s) Online"
- Updates instantly as admins connect/disconnect

## Security

- ✅ Only admins can access `/admin`
- ✅ Non-admins redirected to `/notes`
- ✅ Suspended users cannot login
- ✅ All actions logged and timestamped

## Tips & Tricks

1. **Restoring Users**: Activate (don't delete) unless you want to permanently remove
2. **Bulk Actions**: Not available yet; use pagination to find specific items
3. **Sorting**: Click column headers? (Not implemented yet; use filters)
4. **Time Range**: Analytics always show last 30 days by default
5. **Search**: Works on Trash and Audit Logs (case-insensitive)

## Keyboard Shortcuts

None implemented yet. Navigate using sidebar links.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't access /admin | Check if you're admin (ask another admin to promote you) |
| Real-time feed not updating | Refresh page and check browser console for errors |
| Charts not showing | Try different time range or refresh |
| Pagination broken | Ensure page number is within range |

## Common Tasks

### Suspend a Disruptive User
1. Go to `/admin/users`
2. Find user
3. Click "Suspend"
4. They cannot login

### Restore a Deleted Note
1. Go to `/admin/trash`
2. Search for note title
3. Click "Restore"
4. Note reappears in user's active notes

### Clean Up Spam Tags
1. Go to `/admin/tags`
2. Search for tag name
3. Click delete icon
4. Tag is removed (unlinked from all notes)

### Check Who Created a Note
1. Go to `/admin/audit`
2. Filter by action: "note_created"
3. Find the entry
4. See timestamp and user

## Performance Tips

- **Pagination**: Lists show 25 items max per page to stay fast
- **Filters**: Use them to reduce data before viewing
- **Charts**: Default to 30 days; use 7-day filter if slow

## Access Control

- **Non-admin users**: Cannot access /admin at all
- **Admins**: Can access all admin features
- **Suspended users**: Cannot login (redirected to auth)

## Audit Trail Examples

```
Action: note_created
User: john@example.com
Target: note-uuid-123
Metadata: {"title": "My First Note"}
Timestamp: 2024-04-24 15:37:13
```

```
Action: user_suspended
User: admin@example.com
Target: user-uuid-456
Metadata: {}
Timestamp: 2024-04-24 15:35:22
```

## Help & Support

For issues:
1. Check browser console (F12 > Console)
2. Check server logs
3. Verify JWT token is valid
4. Ensure admin role is set correctly

---

**Last Updated:** 2024-04-24
**Admin Panel Version:** 1.0.0
