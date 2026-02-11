import admin from "firebase-admin";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = join(__dirname, "../../service-account.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const defaultTemplates = [
  {
    name: "Welcome Email",
    subject: "Welcome to Smart Automated Drying System",
    category: "User Notification",
    content: `Dear {name},

Welcome to the Smart Automated Drying System! Your account has been successfully created.

We're excited to have you on board. Our system will help you monitor and manage your drying operations efficiently.

If you have any questions or need assistance, please don't hesitate to contact our support team.

Best regards,
The Smart Drying Team`,
    createdAt: new Date(),
  },
  {
    name: "Password Reset",
    subject: "Reset Your Password - Smart Drying System",
    category: "User Notification",
    content: `Dear {name},

We received a request to reset your password for your Smart Automated Drying System account.

Click the link below to reset your password:
{resetLink}

This link will expire in 24 hours for security purposes.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The Smart Drying Team`,
    createdAt: new Date(),
  },
  {
    name: "Ticket Resolved",
    subject: "Your Support Ticket Has Been Resolved",
    category: "Status Update",
    content: `Dear {name},

Good news! Your support ticket #{ticketId} has been marked as resolved.

Issue Type: {issueType}
Resolution Notes: {notes}

If you have any additional questions or if the issue persists, please don't hesitate to create a new ticket or reply to this email.

Thank you for your patience.

Best regards,
Support Team`,
    createdAt: new Date(),
  },
  {
    name: "Device Assignment",
    subject: "Device Assigned to Your Account",
    category: "Status Update",
    content: `Dear {name},

A new device has been assigned to your account.

Device ID: {deviceId}
MAC Address: {macId}
Assigned Date: {assignedDate}

You can now start using this device with our system. Please ensure it's properly connected and configured.

If you have any questions about your new device, please contact our support team.

Best regards,
The Smart Drying Team`,
    createdAt: new Date(),
  },
  {
    name: "Maintenance Notice",
    subject: "Scheduled System Maintenance",
    category: "General",
    content: `Dear User,

We want to inform you about scheduled maintenance for the Smart Automated Drying System.

Maintenance Date: {date}
Expected Downtime: {duration}

During this time, the system may be intermittent or temporarily unavailable. We apologize for any inconvenience this may cause.

We're performing this maintenance to improve system performance and add new features.

Thank you for your patience and understanding.

Best regards,
The Smart Drying Team`,
    createdAt: new Date(),
  },
  {
    name: "Account Activation",
    subject: "Your Account Has Been Activated",
    category: "User Notification",
    content: `Dear {name},

Your account has been successfully activated!

You can now access all features of the Smart Automated Drying System. Login to your account to get started.

Account Email: {email}
Activation Date: {activationDate}

If you have any questions or need assistance getting started, our support team is here to help.

Best regards,
The Smart Drying Team`,
    createdAt: new Date(),
  },
];

async function initializeEmailTemplates() {
  try {
    console.log("Starting email templates migration...");

    const templatesRef = db.collection("email-templates");
    
    // Check if templates already exist
    const existingTemplates = await templatesRef.get();
    
    if (!existingTemplates.empty) {
      console.log(`Found ${existingTemplates.size} existing templates.`);
      console.log("Do you want to overwrite? This will delete existing templates.");
      console.log("Skipping migration to preserve existing data.");
      console.log("If you want to reset, manually delete the email-templates collection first.");
      return;
    }

    // Add default templates
    for (const template of defaultTemplates) {
      const docRef = await templatesRef.add(template);
      console.log(`✓ Created template: ${template.name} (ID: ${docRef.id})`);
    }

    console.log("\n✅ Email templates migration completed successfully!");
    console.log(`Total templates created: ${defaultTemplates.length}`);
  } catch (error) {
    console.error("❌ Error during migration:", error);
    throw error;
  } finally {
    // Close the Firebase connection
    await admin.app().delete();
  }
}

// Run the migration
initializeEmailTemplates()
  .then(() => {
    console.log("Migration script finished.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
