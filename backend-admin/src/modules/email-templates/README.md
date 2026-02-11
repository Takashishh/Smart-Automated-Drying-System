# Email Templates Feature - Setup Guide

## Overview
The Email Templates feature allows admins to send emails to users using pre-defined templates through Gmail SMTP. This feature includes:
- Template management (stored in Firestore)
- Email sending through Gmail
- Email logs tracking
- Variable substitution in templates (e.g., {name}, {email})

## Prerequisites
- Gmail account with App Password set up
- SMTP credentials configured in the backend
- Firebase Admin SDK configured

## Setup Instructions

### 1. Configure Gmail SMTP (Already Done)
The backend is already configured with Gmail SMTP in [src/server.ts](../src/server.ts):
```typescript
await server.register(emailPlugin, {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  user: "jefsohandsome1@gmail.com",
  pass: "atdxricoakiwnbcw", // Gmail App Password
});
```

**Important:** For security, you should move these credentials to environment variables:
```env
SMTP_USER=jefsohandsome1@gmail.com
SMTP_PASS=atdxricoakiwnbcw
```

### 2. Initialize Email Templates in Firestore
Run the migration script to add default email templates to your Firestore database:

```bash
cd backend-admin
npm run migrate:email-templates
```

This will create 6 default templates:
1. **Welcome Email** - User onboarding notification
2. **Password Reset** - Password reset link email
3. **Ticket Resolved** - Support ticket resolution notification
4. **Device Assignment** - Device assignment notification
5. **Maintenance Notice** - System maintenance announcements
6. **Account Activation** - Account activation confirmation

### 3. Start the Backend Server
```bash
cd backend-admin
npm run dev
```

The email templates API will be available at:
- `GET /email-templates/get-templates` - Fetch all templates
- `POST /email-templates/send-email` - Send an email using a template
- `GET /email-templates/get-email-logs` - Fetch email sending history

### 4. Start the Frontend
```bash
cd frontend-admin
npm run dev
```

Navigate to **Email Templates** in the admin dashboard sidebar.

## Using the Email Templates Feature

### Frontend Interface
1. **View Templates**: Browse available email templates with their name, subject, and category
2. **Compose Email**: Click "Compose Email" button
3. **Fill Details**:
   - Enter recipient email address
   - Select a template from the dropdown
   - Fill in template variables (e.g., {name}, {ticketId})
4. **Send**: Click "Send Email" to deliver the message
5. **View Logs**: Check recent emails sent in the right sidebar

### Template Variables
Templates support dynamic variables that are replaced when sending:
- `{name}` - Recipient's name
- `{email}` - Recipient's email
- `{ticketId}` - Ticket number
- `{issueType}` - Type of issue
- `{notes}` - Resolution notes
- `{deviceId}` - Device identifier
- `{macId}` - MAC address
- `{assignedDate}` - Assignment date
- `{date}` - General date placeholder
- `{duration}` - Duration placeholder
- `{resetLink}` - Password reset link
- `{activationDate}` - Account activation date

### Password Reset Flow
The password reset feature has been updated to automatically send emails:
1. Admin initiates password reset for a user
2. System generates Firebase password reset link
3. Email is automatically sent to the user with styled HTML template
4. Email includes the reset link and security warnings
5. Email is logged in Firestore for audit purposes

## API Endpoints

### GET /email-templates/get-templates
Fetch all email templates (optionally filter by category).

**Query Parameters:**
- `category` (optional): Filter templates by category

**Response:**
```json
{
  "message": "Templates fetched successfully",
  "data": [
    {
      "id": "template-id",
      "name": "Welcome Email",
      "subject": "Welcome to Smart Drying System",
      "category": "User Notification",
      "content": "Dear {name},...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /email-templates/send-email
Send an email using a template.

**Request Body:**
```json
{
  "recipient": "user@example.com",
  "templateId": "template-id",
  "variables": {
    "name": "John Doe",
    "email": "user@example.com"
  },
  "adminId": "admin-uid"
}
```

**Response:**
```json
{
  "message": "Email sent successfully",
  "data": {
    "recipient": "user@example.com",
    "templateName": "Welcome Email"
  }
}
```

### GET /email-templates/get-email-logs
Fetch email sending history.

**Response:**
```json
{
  "message": "Email logs fetched successfully",
  "data": [
    {
      "id": "log-id",
      "sentBy": "admin-uid",
      "recipient": "user@example.com",
      "templateName": "Welcome Email",
      "templateId": "template-id",
      "subject": "Welcome to Smart Drying System",
      "sentDate": "2024-01-01T00:00:00.000Z",
      "status": "sent",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Firestore Collections

### email-templates
Stores email template definitions.

**Document Structure:**
```typescript
{
  name: string;           // Template name
  subject: string;        // Email subject
  category: string;       // Template category
  content: string;        // Email content with variables
  createdAt: Date;        // Creation timestamp
}
```

### email-logs
Stores email sending history.

**Document Structure:**
```typescript
{
  sentBy: string;         // Admin UID who sent the email
  recipient: string;      // Recipient email address
  templateName: string;   // Template used
  templateId: string;     // Template document ID
  subject: string;        // Email subject
  sentDate: string;       // ISO timestamp of sending
  status: 'sent' | 'failed';  // Delivery status
  error?: string;         // Error message if failed
  createdAt: Date;        // Creation timestamp
}
```

## Code Architecture

### Backend Structure
```
backend-admin/src/modules/email-templates/
├── schema/
│   └── email-schemas.ts         # TypeBox validation schemas
├── service/
│   ├── get-templates.ts         # Fetch templates from Firestore
│   ├── send-email.ts            # Send email logic
│   └── get-email-logs.ts        # Fetch email logs
├── controller/
│   ├── get-templates-controller.ts
│   ├── send-email-controller.ts
│   └── get-email-logs-controller.ts
└── router/
    └── index.ts                 # Route definitions
```

### Frontend Structure
```
frontend-admin/src/
├── api/email-templates/
│   ├── get-email-templates.ts   # API call to fetch templates
│   ├── send-email.ts            # API call to send email
│   └── get-email-logs.ts        # API call to fetch logs
├── src/
│   ├── hooks/
│   │   └── useEmails.ts         # Email templates hook
│   └── pages/
│       └── EmailTemplatesPage.tsx  # Email templates UI
```

## Troubleshooting

### Emails Not Sending
1. **Check Gmail Credentials**: Ensure the Gmail App Password is correct
2. **Check Firebase Auth**: Ensure Firebase Admin SDK can access user emails
3. **Check Logs**: Look at backend logs for error messages
4. **Check Network**: Ensure the server can reach Gmail SMTP (smtp.gmail.com:465)

### Templates Not Showing
1. **Run Migration**: Make sure you ran `npm run migrate:email-templates`
2. **Check Firestore**: Verify templates exist in the `email-templates` collection
3. **Check Auth**: Ensure admin is authenticated and has proper permissions

### Variables Not Replaced
1. **Check Format**: Variables must be in `{variableName}` format
2. **Pass Variables**: Ensure variables object is passed when sending email
3. **Check Spelling**: Variable names are case-sensitive

## Security Considerations

1. **SMTP Credentials**: Move Gmail credentials to environment variables
2. **Rate Limiting**: Consider adding rate limiting to prevent email spam
3. **Template Validation**: Validate template content to prevent XSS attacks
4. **Audit Logging**: All email sends are logged for audit purposes
5. **Authentication**: All endpoints require Firebase authentication

## Future Enhancements

- [ ] Rich text editor for template content
- [ ] Template preview with sample data
- [ ] Email scheduling
- [ ] Bulk email sending
- [ ] Email analytics (open rates, click rates)
- [ ] Template versioning
- [ ] Email attachments support
- [ ] Custom SMTP configuration per template

## Hard-Coded Email Reference

The system uses the hardcoded email implementation in [create-admin.ts](../src/shared/service/create-admin.ts) as a reference for the email flow:

1. **HTML Email Template**: Styled with inline CSS for email client compatibility
2. **Plain Text Fallback**: Text version for non-HTML email clients
3. **Error Handling**: Continues even if email sending fails
4. **Logging**: Logs email attempts for debugging

The same pattern is used throughout the email templates feature for consistency.
