# Quick Start Guide - Email Templates Feature

## 🚀 Starting the Application

### Option 1: Using npm scripts (Recommended)

#### Start Backend
Open a terminal in the backend directory and run:
```bash
cd C:\Smart-Automated-Drying-System\backend-admin
npm run build
npm start
```

The backend will start on `http://localhost:3000`

#### Start Frontend
Open another terminal in the frontend directory and run:
```bash
cd C:\Smart-Automated-Drying-System\frontend-admin
npm run dev
```

The frontend will start on `http://localhost:5173`

### Option 2: Using PowerShell directly

#### Terminal 1 - Backend:
```powershell
cd C:\Smart-Automated-Drying-System\backend-admin
npm run build
node dist/index.js
```

#### Terminal 2 - Frontend:
```powershell
cd C:\Smart-Automated-Drying-System\frontend-admin
npm run dev
```

## ✅ Verify Everything Works

1. **Backend Health Check**:
   - Go to: `http://localhost:3000/` in your browser
   - You should see the Fastify server response

2. **Frontend Access**:
   - Go to: `http://localhost:5173/` in your browser
   - Login to the admin dashboard

3. **Test Email Templates**:
   - Click "Email Templates" in the sidebar
   - You should see 6 default templates
   - Click "Compose Email" to test sending

## 📧 Send Your First Email

1. Click **"Compose Email"** button
2. Enter recipient email (use your own email for testing)
3. Select **"Welcome Email"** template
4. Fill in the **name** field
5. Click **"Send Email"**
6. Check your email inbox! 📬

## 🔍 Troubleshooting

### Backend Won't Start
**Error**: "port already in use"
**Solution**: Kill any existing Node processes:
```powershell
Get-Process | Where-Object { $_.ProcessName -eq 'node' } | Stop-Process -Force
```

Then restart the backend.

### Frontend Won't Connect
**Check**: Is the backend running?
```powershell
# Test backend API
curl http://localhost:3000/
```

**Check**: Is VITE_API_URL set correctly?
Should be in `frontend-admin/.env`:
```env
VITE_API_URL=http://localhost:3000
```

### Email Not Sending
**Check**: Are Gmail SMTP credentials correct?
They're in `backend-admin/src/server.ts`:
```typescript
user: "jefsohandsome1@gmail.com",
pass: "atdxricoakiwnbcw",
```

**Check**: Backend logs for errors:
Look for lines containing `[PASSWORD_RESET]` or email-related errors

### Templates Not Showing
**Run the migration again**:
```bash
cd C:\Smart-Automated-Drying-System\backend-admin
npm run migrate:email-templates
```

**Check Firestore**: Verify `email-templates` collection exists

## 📊 Monitor Email Activity

### View Email Logs in Dashboard
1. Go to **Email Templates** page
2. Look at the **"Recent Email Logs"** sidebar on the right
3. You'll see:
   - Template used
   - Recipient email
   - Timestamp
   - Status (sent/failed)

### View Logs in Firestore
1. Open Firebase Console
2. Go to Firestore Database
3. Check the `email-logs` collection
4. Each document contains full details of sent emails

### View Audit Logs
1. Go to **Audit Logs** page in admin dashboard
2. Look for entries with action: "Send Email"
3. Shows who sent what to whom and when

## 🎯 Common Use Cases

### Send Password Reset
1. Go to **Users** page
2. Click on a user
3. Click **"Send Password Reset"** button
4. User receives email with reset link automatically! ✨

### Send Welcome Email to New User
1. Go to **Email Templates** page
2. Click **"Compose Email"**
3. Select **"Welcome Email"** template
4. Enter user's email and name
5. Send!

### Notify User of Ticket Resolution
1. Resolve a ticket in **Tickets** page
2. Go to **Email Templates**
3. Select **"Ticket Resolved"** template
4. Fill in:
   - User's email
   - User's name
   - Ticket ID
   - Issue type
   - Resolution notes
5. Send!

### Announce Maintenance
1. Go to **Email Templates**
2. Select **"Maintenance Notice"**
3. Fill in:
   - Maintenance date
   - Expected duration
4. Send to multiple users (one at a time for now)

## 💡 Pro Tips

### Test with Your Own Email First
Always test new templates by sending to your own email address first!

### Check Spam Folder
Gmail might mark test emails as spam initially. Mark them as "Not Spam" to train the filter.

### Use Variable Names Consistently
When creating custom templates, use descriptive variable names:
- `{name}` for person's name
- `{email}` for email address
- `{date}` for dates
- `{ticketId}` for ticket numbers
- etc.

### Monitor Failed Emails
Check the email logs regularly for failed sends. Common causes:
- Invalid recipient email
- Gmail rate limiting
- Network issues
- SMTP credentials expired

## 📝 What's Different from Before?

### Before (Mock Data)
- Templates were hardcoded in the frontend
- Clicking "Send Email" did nothing real
- No actual emails were sent
- No logging or tracking

### After (Real Implementation)
✅ Templates stored in Firestore  
✅ Real emails sent through Gmail SMTP  
✅ Full variable substitution support  
✅ Styled HTML emails with responsive design  
✅ Email logging in Firestore  
✅ Audit trail for compliance  
✅ Error handling and logging  
✅ Password reset emails automated  

## 🎉 Success!

If you can:
1. ✅ See 6 templates in the Email Templates page
2. ✅ Send an email and receive it in your inbox
3. ✅ See the email in the Recent Logs sidebar
4. ✅ Send a password reset and user receives it

**Congratulations! The Email Templates feature is fully functional!** 🚀

---

For more detailed information, see:
- `EMAIL_TEMPLATES_IMPLEMENTATION.md` - Full implementation details
- `backend-admin/src/modules/email-templates/README.md` - API documentation
- Backend logs - For debugging email issues

Happy emailing! 📧✨
